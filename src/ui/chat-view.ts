import {
  ItemView,
  WorkspaceLeaf,
  App,
} from "obsidian";
import { t } from "../i18n";
import { ApiClient } from "../api/types";
import { ChatCore } from "../core/chat-core";
import { createDefaultToolRegistry } from "../core/tools";
import { renderChatApp } from "../react";
import type GoliathPlugin from "../main";

export const VIEW_TYPE_GOLIATH_CHAT = "goliath-chat-view";

export class ChatView extends ItemView {
  private appRef: App | null = null;
  private apiClient: ApiClient | null = null;
  private chatCore: ChatCore | null = null;
  private plugin: GoliathPlugin;
  private currentProviderName = "";
  private currentModel = "";
  private onSwitchModel?: () => Promise<void>;
  private reactRoot: { unmount: () => void } | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: GoliathPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_GOLIATH_CHAT;
  }

  getDisplayText(): string {
    return t().ui.chatViewTitle;
  }

  getIcon(): string {
    return "message-circle";
  }

  setApp(app: App): void {
    this.appRef = app;
  }

  setApiClient(client: ApiClient): void {
    this.apiClient = client;
    if (this.appRef) {
      this.chatCore = new ChatCore({
        apiClient: client,
        toolRegistry: createDefaultToolRegistry(),
        app: this.appRef,
      });
    }
  }

  setSystemPrompt(prompt: string): void {
    // System prompt is managed by React state; store for React to access
    (this as any)._systemPrompt = prompt;
    // Dispatch a custom event so React can pick it up
    this.containerEl.dispatchEvent(
      new CustomEvent("goliath-system-prompt", { detail: { prompt } })
    );
  }

  setModelInfo(
    providerName: string,
    model: string,
    onSwitch: () => Promise<void>
  ): void {
    this.currentProviderName = providerName;
    this.currentModel = model;
    this.onSwitchModel = onSwitch;
    this.containerEl.dispatchEvent(
      new CustomEvent("goliath-model-info", {
        detail: { providerName, model, onSwitch },
      })
    );
  }

  getChatCore(): ChatCore | null {
    return this.chatCore;
  }

  getApiClient(): ApiClient | null {
    return this.apiClient;
  }

  getCurrentProviderName(): string {
    return this.currentProviderName;
  }

  getCurrentModel(): string {
    return this.currentModel;
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("goliath-chat-view");

    // Create React mount container
    const reactContainer = container.createDiv("goliath-react-root");
    reactContainer.style.width = "100%";
    reactContainer.style.height = "100%";

    // Render React app
    this.reactRoot = renderChatApp(reactContainer, {
      app: this.app,
      plugin: this.plugin,
      view: this,
    });
  }

  async onClose(): Promise<void> {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
  }
}
