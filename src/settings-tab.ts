import { App, PluginSettingTab, Setting, Notice } from "obsidian";
import GoliathPlugin from "./main";
import { ApiProvider, ExportFormat, Language } from "./settings";
import { t, formatTemplate } from "./i18n";
import { loadTokens, saveTokens, deleteTokens, type DataStorage } from "./auth/kimi-oauth";
import { KimiLoginModal } from "./ui/kimi-login-modal";

export class GoliathSettingTab extends PluginSettingTab {
  plugin: GoliathPlugin;

  constructor(app: App, plugin: GoliathPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    const i18n = t();

    containerEl.createEl("h2", { text: i18n.settings.title });

    this.addLanguageSetting();
    this.addDefaultProviderSetting();
    this.addDefaultFormatSetting();
    this.addSystemPromptSetting();
    this.addContextSettings();

    containerEl.createEl("h3", { text: i18n.settings.apiProviders });

    this.addProviderSetting("anthropic");
    this.addProviderSetting("gemini");
    this.addProviderSetting("kimi");
    this.addProviderSetting("local");
  }

  private addLanguageSetting(): void {
    const i18n = t();
    new Setting(this.containerEl)
      .setName(i18n.settings.language)
      .setDesc(i18n.settings.languageDesc)
      .addDropdown((dropdown) =>
        dropdown
          .addOption("en", "English")
          .addOption("zh", "中文")
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings.language = value as Language;
            await this.plugin.saveSettings();
            this.display();
          })
      );
  }

  private addDefaultProviderSetting(): void {
    const i18n = t();
    new Setting(this.containerEl)
      .setName(i18n.settings.defaultProvider)
      .setDesc(i18n.settings.defaultProviderDesc)
      .addDropdown((dropdown) =>
        dropdown
          .addOptions(i18n.ui.providerNames)
          .setValue(this.plugin.settings.defaultProvider)
          .onChange(async (value) => {
            this.plugin.settings.defaultProvider = value as ApiProvider;
            await this.plugin.saveSettings();
          })
      );
  }

  private addDefaultFormatSetting(): void {
    const i18n = t();
    new Setting(this.containerEl)
      .setName(i18n.settings.defaultFormat)
      .setDesc(i18n.settings.defaultFormatDesc)
      .addDropdown((dropdown) =>
        dropdown
          .addOptions(i18n.ui.exportFormatNames)
          .setValue(this.plugin.settings.defaultFormat)
          .onChange(async (value) => {
            this.plugin.settings.defaultFormat = value as ExportFormat;
            await this.plugin.saveSettings();
          })
      );
  }

  private addSystemPromptSetting(): void {
    const i18n = t();
    new Setting(this.containerEl)
      .setName(i18n.settings.systemPrompt)
      .setDesc(i18n.settings.systemPromptDesc)
      .addTextArea((text) =>
        text
          .setValue(this.plugin.settings.systemPrompt)
          .onChange(async (value) => {
            this.plugin.settings.systemPrompt = value;
            await this.plugin.saveSettings();
          })
      );
  }

  private addContextSettings(): void {
    const i18n = t();
    new Setting(this.containerEl)
      .setName(i18n.settings.includeFrontmatter)
      .setDesc(i18n.settings.includeFrontmatterDesc)
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.includeFrontmatter)
          .onChange(async (value) => {
            this.plugin.settings.includeFrontmatter = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(this.containerEl)
      .setName(i18n.settings.includeLinkedNotes)
      .setDesc(i18n.settings.includeLinkedNotesDesc)
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.includeLinkedNotes)
          .onChange(async (value) => {
            this.plugin.settings.includeLinkedNotes = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(this.containerEl)
      .setName(i18n.settings.maxLinkedDepth)
      .setDesc(i18n.settings.maxLinkedDepthDesc)
      .addSlider((slider) =>
        slider
          .setLimits(1, 3, 1)
          .setValue(this.plugin.settings.maxLinkedDepth)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.maxLinkedDepth = value;
            await this.plugin.saveSettings();
          })
      );
  }

  private addProviderSetting(provider: ApiProvider): void {
    const config = this.plugin.settings[provider];
    const i18n = t();

    const container = this.containerEl.createDiv();
    container.createEl("h4", { text: i18n.ui.providerNames[provider] });

    new Setting(container)
      .setName(i18n.settings.enabled)
      .addToggle((toggle) =>
        toggle.setValue(config.enabled).onChange(async (value) => {
          config.enabled = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(container)
      .setName(i18n.settings.apiKey)
      .setDesc(i18n.settings.apiKeyDesc)
      .addText((text) =>
        text
          .setPlaceholder(i18n.settings.apiKey)
          .setValue(config.apiKey)
          .onChange(async (value) => {
            config.apiKey = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(container)
      .setName(i18n.settings.baseUrl)
      .setDesc(i18n.settings.baseUrlDesc)
      .addText((text) =>
        text
          .setPlaceholder("https://api.example.com")
          .setValue(config.baseUrl)
          .onChange(async (value) => {
            config.baseUrl = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(container)
      .setName(i18n.settings.model)
      .setDesc(i18n.settings.modelDesc)
      .addText((text) =>
        text
          .setPlaceholder("model-name")
          .setValue(config.model)
          .onChange(async (value) => {
            config.model = value;
            await this.plugin.saveSettings();
          })
      );

    if (provider === "kimi") {
      this.addKimiOAuthControls(container);
    }
  }

  private addKimiOAuthControls(container: HTMLElement): void {
    const oauthContainer = container.createDiv();
    oauthContainer.style.marginTop = "12px";
    oauthContainer.createEl("h5", { text: "OAuth" });

    const storage: DataStorage = {
      loadData: () => this.plugin.loadData(),
      saveData: (data) => this.plugin.saveData(data),
    };

    loadTokens(storage).then((tokens) => {
      oauthContainer.empty();
      oauthContainer.createEl("h5", { text: "OAuth" });

      if (tokens) {
        const statusEl = oauthContainer.createEl("p", {
          text: `Logged in (expires: ${new Date(tokens.expiresAt * 1000).toLocaleString()})`,
        });
        statusEl.style.color = "var(--text-success)";

        const logoutButton = oauthContainer.createEl("button", {
          text: "Logout from Kimi",
        });
        logoutButton.addEventListener("click", async () => {
          await deleteTokens(storage);
          new Notice("Logged out from Kimi");
          this.display();
        });
      } else {
        const statusEl = oauthContainer.createEl("p", {
          text: "Not logged in. Use the button below to authenticate.",
        });
        statusEl.style.color = "var(--text-muted)";

        const loginButton = oauthContainer.createEl("button", {
          text: "Login with Kimi",
          cls: "mod-cta",
        });
        loginButton.addEventListener("click", async () => {
          const data = (await this.plugin.loadData()) as Record<string, unknown> | undefined;
          const rawDeviceId = data?.kimiDeviceId;
          let deviceId: string;
          if (typeof rawDeviceId !== "string" || !rawDeviceId) {
            deviceId = crypto.randomUUID();
            await this.plugin.saveData({ ...data, kimiDeviceId: deviceId });
          } else {
            deviceId = rawDeviceId;
          }

          new KimiLoginModal(this.app, deviceId, async (tokens) => {
            await saveTokens(tokens, storage);
            const i18n = t();
            new Notice(i18n.ui.kimiLoginSuccess ?? "Kimi login successful!");
            this.display();
          }).open();
        });
      }
    });
  }
}
