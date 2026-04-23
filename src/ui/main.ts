import {
  Plugin,
  WorkspaceLeaf,
  Notice,
  TFile,
  addIcon,
} from "obsidian";
import {
  GoliathSettings,
  DEFAULT_SETTINGS,
  ApiProvider,
} from "./settings";
import { GoliathSettingTab } from "./settings-tab";
import { ChatView, VIEW_TYPE_GOLIATH_CHAT } from "./ui/chat-view";
import { ExportModal } from "./ui/export-modal";
import { buildContextWithLinked } from "./utils/vault-helpers";
import { AnthropicClient } from "./api/anthropic-client";
import { GeminiClient } from "./api/gemini-client";
import { OpenAiClient } from "./api/openai-client";
import { ApiClient } from "./api/types";
import { setLanguage, t, formatTemplate } from "./i18n";
import { ensureFreshTokens, type DataStorage } from "./auth/kimi-oauth";
import { SessionManager } from "./core/session-manager";

const GOLIATH_ICON = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
  <path d="M2 17l10 5 10-5"/>
  <path d="M2 12l10 5 10-5"/>
</svg>
`;

export default class GoliathPlugin extends Plugin {
  settings: GoliathSettings;
  sessionManager: SessionManager;

  async onload(): Promise<void> {
    this.sessionManager = new SessionManager(this.app);
    await this.loadSettings();
    setLanguage(this.settings.language);

    addIcon("goliath", GOLIATH_ICON);

    this.registerView(
      VIEW_TYPE_GOLIATH_CHAT,
      (leaf) => new ChatView(leaf)
    );

    const i18n = t();

    this.addCommand({
      id: "open-goliath-chat",
      name: i18n.commands.openChat,
      callback: () => this.openChatView(),
    });

    this.addCommand({
      id: "export-current-note",
      name: i18n.commands.exportNote,
      editorCallback: () => this.exportCurrentNote(),
    });

    this.addCommand({
      id: "chat-with-current-note",
      name: i18n.commands.chatWithNote,
      editorCallback: () => this.chatWithCurrentNote(),
    });

    this.addRibbonIcon("goliath", i18n.ui.chatViewTitle, () => {
      this.openChatView();
    });

    this.addSettingTab(new GoliathSettingTab(this.app, this));
  }

  onunload(): void {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_GOLIATH_CHAT);
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  private async openChatView(): Promise<void> {
    try {
      const { workspace } = this.app;

      let leaf = workspace.getLeavesOfType(VIEW_TYPE_GOLIATH_CHAT)[0];
      if (!leaf) {
        leaf = workspace.getRightLeaf(false);
        await leaf.setViewState({
          type: VIEW_TYPE_GOLIATH_CHAT,
          active: true,
        });
      }

      workspace.revealLeaf(leaf);
      await this.configureChatView(leaf);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[Goliath] Failed to open chat view:", message);
      new Notice(`Goliath error: ${message}`, 5000);
    }
  }

  private async configureChatView(leaf: WorkspaceLeaf): Promise<void> {
    try {
      const view = leaf.view;
      if (!(view instanceof ChatView)) return;

      view.setApp(this.app);
      const client = await this.createApiClient(this.settings.defaultProvider);
      if (client) {
        view.setApiClient(client);
      }
      view.setSystemPrompt(this.settings.systemPrompt);

      const providerConfig = this.settings[this.settings.defaultProvider];
      const providerName = t().ui.providerNames[this.settings.defaultProvider] ?? this.settings.defaultProvider;
      view.setModelInfo(providerName, providerConfig.model, async () => {
        const providers: ApiProvider[] = ["anthropic", "gemini", "kimi", "local"];
        const enabledProviders = providers.filter((p) => this.settings[p].enabled);
        if (enabledProviders.length <= 1) {
          new Notice("No other providers enabled", 3000);
          return;
        }

        const currentIndex = enabledProviders.indexOf(this.settings.defaultProvider);
        const nextIndex = (currentIndex + 1) % enabledProviders.length;
        const nextProvider = enabledProviders[nextIndex];
        this.settings.defaultProvider = nextProvider;
        await this.saveSettings();

        await this.configureChatView(leaf);
        const nextProviderName = t().ui.providerNames[nextProvider] ?? nextProvider;
        new Notice(`Switched to ${nextProviderName}`, 3000);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[Goliath] Failed to configure chat view:", message);
      new Notice(`Goliath error: ${message}`, 5000);
    }
  }

  private async exportCurrentNote(): Promise<void> {
    try {
      const file = this.app.workspace.getActiveFile();
      if (!file) {
        new Notice(t().ui.noActiveNote);
        return;
      }

      const contexts = await buildContextWithLinked(
        this.app.vault,
        this.app.metadataCache,
        file,
        this.settings.includeFrontmatter,
        this.settings.includeLinkedNotes,
        this.settings.maxLinkedDepth
      );

      new ExportModal(this.app, this.settings, contexts, (text, format) => {
        navigator.clipboard.writeText(text);
        const formatName = t().ui.exportFormatNames[format] ?? format;
        new Notice(formatTemplate(t().ui.copiedToClipboard, { format: formatName }));
      }).open();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[Goliath] Failed to export note:", message);
      new Notice(`Goliath error: ${message}`, 5000);
    }
  }

  private async chatWithCurrentNote(): Promise<void> {
    try {
      const file = this.app.workspace.getActiveFile();
      if (!file) {
        new Notice(t().ui.noActiveNote);
        return;
      }

      await this.openChatView();

      const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_GOLIATH_CHAT)[0];
      if (!leaf) return;

      const view = leaf.view;
      if (!(view instanceof ChatView)) return;

      const contexts = await buildContextWithLinked(
        this.app.vault,
        this.app.metadataCache,
        file,
        this.settings.includeFrontmatter,
        this.settings.includeLinkedNotes,
        this.settings.maxLinkedDepth
      );

      const contextText = contexts
        .map((ctx) => `File: ${ctx.path}\n${ctx.content}`)
        .join("\n\n---\n\n");

      const systemPrompt = this.settings.systemPrompt
        ? `${this.settings.systemPrompt}\n\n---\n\n${contextText}`
        : contextText;
      view.setSystemPrompt(systemPrompt);

      console.log("[Goliath] Chat context built:", {
        file: file.path,
        contextChunks: contexts.length,
        contextLength: contextText.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[Goliath] Failed to chat with note:", message);
      new Notice(`Goliath error: ${message}`, 5000);
    }
  }

  private async createApiClient(provider: ApiProvider): Promise<ApiClient | null> {
    const config = this.settings[provider];
    if (!config.enabled) {
      const providerName = t().ui.providerNames[provider] ?? provider;
      new Notice(formatTemplate(t().ui.providerNotConfigured, { provider: providerName }));
      return null;
    }

    let apiKey = config.apiKey;

    if (provider === "kimi") {
      try {
        const storage: DataStorage = {
          loadData: () => this.loadData(),
          saveData: (data) => this.saveData(data),
        };
        const data = (await this.loadData()) as Record<string, unknown> | undefined;
        let deviceId = data?.kimiDeviceId;
        if (typeof deviceId !== "string" || !deviceId) {
          deviceId = crypto.randomUUID();
          await this.saveData({ ...data, kimiDeviceId: deviceId });
        }
        const tokens = await ensureFreshTokens(storage, deviceId as string);
        if (tokens) {
          apiKey = tokens.accessToken;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("[Goliath] Kimi OAuth error:", message);
        new Notice(`Kimi login error: ${message}`, 5000);
      }
    }

    if (!apiKey) {
      const providerName = t().ui.providerNames[provider] ?? provider;
      new Notice(formatTemplate(t().ui.providerNotConfigured, { provider: providerName }));
      return null;
    }

    switch (provider) {
      case "anthropic":
        return new AnthropicClient(apiKey, config.baseUrl, config.model);
      case "gemini":
        return new GeminiClient(apiKey, config.baseUrl, config.model);
      case "kimi":
        return new OpenAiClient(apiKey, config.baseUrl, config.model);
      case "local":
        return new OpenAiClient(apiKey, config.baseUrl, config.model);
      default:
        return null;
    }
  }
}
