import {
  ItemView,
  WorkspaceLeaf,
  MarkdownRenderer,
  Component,
  Notice,
  App,
} from "obsidian";
import { ApiClient, ChatRequest, Message, ToolResult } from "../api/types";
import { t } from "../i18n";
import { ChatCore } from "../core/chat-core";
import { createDefaultToolRegistry } from "../core/tools";

export const VIEW_TYPE_GOLIATH_CHAT = "goliath-chat-view";

interface ChatMessage extends Message {
  id: string;
}

export class ChatView extends ItemView {
  private messages: ChatMessage[] = [];
  private apiClient: ApiClient | null = null;
  private chatCore: ChatCore | null = null;
  private appRef: App | null = null;
  private messageContainer: HTMLElement | null = null;
  private inputElement: HTMLTextAreaElement | null = null;
  private sendButton: HTMLButtonElement | null = null;
  private modelLabelEl: HTMLElement | null = null;
  private currentProviderName = "";
  private currentModel = "";
  private onSwitchModel?: () => Promise<void>;
  private isStreaming = false;
  private streamStyleInjected = false;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
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
    const existingIndex = this.messages.findIndex((m) => m.role === "system");
    if (prompt) {
      const systemMessage: ChatMessage = {
        role: "system",
        content: prompt,
        id: this.generateId(),
      };
      if (existingIndex >= 0) {
        this.messages[existingIndex] = systemMessage;
      } else {
        this.messages.unshift(systemMessage);
      }
    } else if (existingIndex >= 0) {
      this.messages.splice(existingIndex, 1);
    }
  }

  setModelInfo(
    providerName: string,
    model: string,
    onSwitch: () => Promise<void>
  ): void {
    this.currentProviderName = providerName;
    this.currentModel = model;
    this.onSwitchModel = onSwitch;
    this.updateModelLabel();
  }

  private updateModelLabel(): void {
    if (!this.modelLabelEl) return;
    const label = this.currentModel
      ? `${this.currentProviderName} · ${this.currentModel}`
      : this.currentProviderName;
    this.modelLabelEl.innerHTML = `${label} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("goliath-chat-view");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.height = "100%";

    const i18n = t();

    this.messageContainer = container.createDiv({
      cls: "goliath-chat-messages",
    });
    this.messageContainer.style.flex = "1";
    this.messageContainer.style.overflowY = "auto";
    this.messageContainer.style.padding = "12px";
    this.messageContainer.style.display = "flex";
    this.messageContainer.style.flexDirection = "column";
    this.messageContainer.style.gap = "12px";

    const inputWrapper = container.createDiv({
      cls: "goliath-chat-input-wrapper",
    });
    inputWrapper.style.margin = "0 12px 12px 12px";
    inputWrapper.style.padding = "12px 16px";
    inputWrapper.style.border = "1px solid var(--background-modifier-border)";
    inputWrapper.style.borderRadius = "16px";
    inputWrapper.style.backgroundColor = "var(--background-primary)";
    inputWrapper.style.display = "flex";
    inputWrapper.style.flexDirection = "column";
    inputWrapper.style.gap = "8px";

    this.inputElement = inputWrapper.createEl("textarea", {
      cls: "goliath-chat-input",
    });
    this.inputElement.style.width = "100%";
    this.inputElement.style.border = "none";
    this.inputElement.style.outline = "none";
    this.inputElement.style.background = "transparent";
    this.inputElement.style.resize = "none";
    this.inputElement.style.minHeight = "24px";
    this.inputElement.style.maxHeight = "200px";
    this.inputElement.style.height = "24px";
    this.inputElement.style.overflowY = "auto";
    this.inputElement.style.fontSize = "14px";
    this.inputElement.style.lineHeight = "1.5";
    this.inputElement.style.color = "var(--text-normal)";
    this.inputElement.placeholder = i18n.ui.chatPlaceholder;

    this.inputElement.addEventListener("input", () => {
      this.adjustInputHeight();
      this.updateSendButtonState();
    });
    this.inputElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    this.inputElement.addEventListener("focus", () => {
      inputWrapper.style.borderColor = "var(--interactive-accent)";
    });
    this.inputElement.addEventListener("blur", () => {
      inputWrapper.style.borderColor = "var(--background-modifier-border)";
    });

    const inputFooter = inputWrapper.createDiv({
      cls: "goliath-chat-input-footer",
    });
    inputFooter.style.display = "flex";
    inputFooter.style.alignItems = "center";
    inputFooter.style.justifyContent = "space-between";

    const addBtn = inputFooter.createEl("button", {
      cls: "goliath-chat-add-btn",
    });
    addBtn.style.width = "28px";
    addBtn.style.height = "28px";
    addBtn.style.borderRadius = "50%";
    addBtn.style.border = "1px solid var(--background-modifier-border)";
    addBtn.style.background = "transparent";
    addBtn.style.color = "var(--text-muted)";
    addBtn.style.cursor = "pointer";
    addBtn.style.display = "flex";
    addBtn.style.alignItems = "center";
    addBtn.style.justifyContent = "center";
    addBtn.style.padding = "0";
    addBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
    addBtn.title = "Add context";

    const rightSection = inputFooter.createDiv({
      cls: "goliath-chat-input-right",
    });
    rightSection.style.display = "flex";
    rightSection.style.alignItems = "center";
    rightSection.style.gap = "8px";

    this.modelLabelEl = rightSection.createDiv({
      cls: "goliath-chat-model-label",
    });
    this.modelLabelEl.style.fontSize = "12px";
    this.modelLabelEl.style.color = "var(--text-muted)";
    this.modelLabelEl.style.cursor = "pointer";
    this.modelLabelEl.style.display = "flex";
    this.modelLabelEl.style.alignItems = "center";
    this.modelLabelEl.style.gap = "4px";
    this.modelLabelEl.addEventListener("click", () => {
      if (this.onSwitchModel) {
        this.onSwitchModel().catch((error) => {
          const message = error instanceof Error ? error.message : String(error);
          console.error("[Goliath] Switch model error:", message);
          new Notice(`Switch model error: ${message}`, 5000);
        });
      }
    });

    this.sendButton = rightSection.createEl("button", {
      cls: "goliath-chat-send-btn",
    });
    this.sendButton.style.width = "32px";
    this.sendButton.style.height = "32px";
    this.sendButton.style.borderRadius = "50%";
    this.sendButton.style.border = "none";
    this.sendButton.style.backgroundColor = "var(--background-modifier-border-hover)";
    this.sendButton.style.color = "var(--text-on-accent)";
    this.sendButton.style.cursor = "pointer";
    this.sendButton.style.display = "flex";
    this.sendButton.style.alignItems = "center";
    this.sendButton.style.justifyContent = "center";
    this.sendButton.style.padding = "0";
    this.sendButton.style.transition = "background-color 0.2s";
    this.sendButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`;
    this.sendButton.disabled = true;
    this.sendButton.addEventListener("click", () => this.sendMessage());

    this.injectStreamStyles();
  }

  async onClose(): Promise<void> {
    // Cleanup if needed
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  private adjustInputHeight(): void {
    if (!this.inputElement) return;
    this.inputElement.style.height = "auto";
    const newHeight = Math.min(this.inputElement.scrollHeight, 200);
    this.inputElement.style.height = `${newHeight}px`;
  }

  private async sendMessage(): Promise<void> {
    if (!this.inputElement || this.isStreaming) return;
    if (!this.chatCore) {
      new Notice("AI provider not configured. Check settings and API key.", 5000);
      return;
    }

    const userContent = this.inputElement.value.trim();
    if (!userContent) return;

    this.inputElement.value = "";
    this.adjustInputHeight();

    const userMessage: ChatMessage = {
      role: "user",
      content: userContent,
      id: this.generateId(),
    };
    this.messages.push(userMessage);
    this.renderUserMessage(userMessage);

    this.isStreaming = true;
    this.updateSendButtonState();

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: "",
      id: this.generateId(),
    };
    this.messages.push(assistantMessage);

    const { messageEl, contentEl } = this.createAssistantMessageElement();
    const indicatorEl = messageEl.createDiv({
      cls: "goliath-streaming-indicator",
    });
    indicatorEl.innerHTML = "<span></span><span></span><span></span>";

    this.scrollToBottom();

    try {
      let fullContent = "";
      const result = await this.chatCore.sendMessage(
        this.messages,
        (chunk) => {
          fullContent += chunk;
          assistantMessage.content = fullContent;
          contentEl.textContent = fullContent;
          this.scrollToBottom();
        }
      );

      assistantMessage.content = result.content;
      contentEl.empty();
      await this.renderMarkdownContent(contentEl, result.content);
      indicatorEl.remove();

      if (result.toolResults && result.toolResults.length > 0) {
        this.renderToolResults(messageEl, result.toolResults);
      }

      this.addResponseActions(messageEl, assistantMessage);

      if (result.toolResults) {
        const toolMessages = result.toolResults.map((tr) => ({
          role: "tool" as const,
          content: tr.content,
          toolCallId: tr.toolCallId,
        }));
        this.messages.push(...toolMessages);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        indicatorEl.remove();
        return;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[Goliath] Chat error:", {
        error: errorMessage,
        messagesCount: this.messages.length,
        apiClient: this.apiClient?.constructor?.name ?? "null",
      });
      new Notice(`Goliath error: ${errorMessage}`, 5000);

      assistantMessage.content = `Error: ${errorMessage}`;
      contentEl.empty();
      contentEl.textContent = assistantMessage.content;
      contentEl.addClass("goliath-chat-error");
      indicatorEl.remove();
    } finally {
      this.isStreaming = false;
      this.updateSendButtonState();
    }
  }

  private renderUserMessage(message: ChatMessage): void {
    if (!this.messageContainer) return;

    const messageEl = this.messageContainer.createDiv({
      cls: "goliath-chat-message goliath-chat-message-user",
    });
    messageEl.style.alignSelf = "flex-end";
    messageEl.style.maxWidth = "90%";
    messageEl.style.padding = "8px 12px";
    messageEl.style.borderRadius = "8px";
    messageEl.style.backgroundColor = "var(--interactive-accent)";
    messageEl.style.color = "var(--text-on-accent)";

    const contentEl = messageEl.createDiv();
    contentEl.style.whiteSpace = "pre-wrap";
    contentEl.style.wordBreak = "break-word";
    contentEl.textContent = message.content;
  }

  private createAssistantMessageElement(): {
    messageEl: HTMLElement;
    contentEl: HTMLElement;
  } {
    if (!this.messageContainer) {
      const dummy = document.createElement("div");
      return { messageEl: dummy, contentEl: dummy };
    }

    const messageEl = this.messageContainer.createDiv({
      cls: "goliath-chat-message goliath-chat-message-assistant",
    });
    messageEl.style.alignSelf = "flex-start";
    messageEl.style.maxWidth = "90%";
    messageEl.style.padding = "8px 12px";
    messageEl.style.borderRadius = "8px";
    messageEl.style.backgroundColor = "var(--background-secondary)";
    messageEl.style.border = "1px solid var(--background-modifier-border)";

    const contentEl = messageEl.createDiv({
      cls: "goliath-chat-message-content",
    });
    return { messageEl, contentEl };
  }

  private async renderMarkdownContent(
    el: HTMLElement,
    markdown: string
  ): Promise<void> {
    try {
      await MarkdownRenderer.renderMarkdown(
        markdown,
        el,
        "",
        this
      );
      this.enhanceCodeBlocks(el);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[Goliath] Markdown render error:", message);
      el.textContent = markdown;
    }
  }

  private enhanceCodeBlocks(el: HTMLElement): void {
    const preElements = el.querySelectorAll("pre");
    preElements.forEach((pre) => {
      if (pre.querySelector(".goliath-code-copy-btn")) return;

      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      wrapper.style.display = "inline-block";
      wrapper.style.width = "100%";

      const copyBtn = document.createElement("button");
      copyBtn.className = "goliath-code-copy-btn";
      copyBtn.textContent = "Copy";
      copyBtn.style.position = "absolute";
      copyBtn.style.top = "4px";
      copyBtn.style.right = "4px";
      copyBtn.style.padding = "2px 8px";
      copyBtn.style.fontSize = "10px";
      copyBtn.style.borderRadius = "4px";
      copyBtn.style.backgroundColor = "var(--background-primary)";
      copyBtn.style.color = "var(--text-normal)";
      copyBtn.style.border = "1px solid var(--background-modifier-border)";
      copyBtn.style.cursor = "pointer";
      copyBtn.style.opacity = "0";
      copyBtn.style.transition = "opacity 0.2s";

      const codeEl = pre.querySelector("code");
      copyBtn.addEventListener("click", () => {
        if (codeEl) {
          navigator.clipboard.writeText(codeEl.textContent || "");
          copyBtn.textContent = "Copied!";
          setTimeout(() => {
            copyBtn.textContent = "Copy";
          }, 2000);
        }
      });

      pre.addEventListener("mouseenter", () => {
        copyBtn.style.opacity = "1";
      });
      pre.addEventListener("mouseleave", () => {
        copyBtn.style.opacity = "0";
      });

      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      wrapper.appendChild(copyBtn);
    });
  }

  private renderToolResults(
    messageEl: HTMLElement,
    toolResults: ToolResult[]
  ): void {
    const toolsEl = messageEl.createDiv({
      cls: "goliath-tool-results",
    });
    toolsEl.style.marginTop = "8px";
    toolsEl.style.display = "flex";
    toolsEl.style.flexDirection = "column";
    toolsEl.style.gap = "4px";

    for (const result of toolResults) {
      const itemEl = toolsEl.createDiv({
        cls: "goliath-tool-result",
      });
      itemEl.style.fontSize = "11px";
      itemEl.style.padding = "4px 8px";
      itemEl.style.borderRadius = "4px";
      itemEl.style.backgroundColor = "var(--background-modifier-form-field)";
      itemEl.style.color = result.isError
        ? "var(--text-error)"
        : "var(--text-muted)";
      itemEl.style.border = `1px solid ${result.isError ? "var(--background-modifier-error)" : "var(--background-modifier-border)"}`;

      const nameEl = itemEl.createDiv();
      nameEl.style.fontWeight = "bold";
      nameEl.textContent = result.isError
        ? `⚠ ${result.name}`
        : `✓ ${result.name}`;

      const preview = result.content.slice(0, 200);
      const contentEl = itemEl.createDiv();
      contentEl.style.marginTop = "2px";
      contentEl.style.whiteSpace = "pre-wrap";
      contentEl.style.wordBreak = "break-word";
      contentEl.textContent =
        preview + (result.content.length > 200 ? "..." : "");
    }
  }

  private addResponseActions(
    messageEl: HTMLElement,
    message: ChatMessage
  ): void {
    const actionsEl = messageEl.createDiv({
      cls: "goliath-message-actions",
    });
    actionsEl.style.display = "flex";
    actionsEl.style.gap = "8px";
    actionsEl.style.marginTop = "8px";
    actionsEl.style.paddingTop = "8px";
    actionsEl.style.borderTop = "1px solid var(--background-modifier-border-hover)";
    actionsEl.style.opacity = "0";
    actionsEl.style.transition = "opacity 0.2s";

    const copyBtn = actionsEl.createEl("button", {
      text: "Copy",
      cls: "goliath-action-btn",
    });
    copyBtn.style.fontSize = "11px";
    copyBtn.style.padding = "2px 8px";
    copyBtn.style.background = "transparent";
    copyBtn.style.border = "1px solid var(--background-modifier-border)";
    copyBtn.style.borderRadius = "4px";
    copyBtn.style.color = "var(--text-muted)";
    copyBtn.style.cursor = "pointer";
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(message.content);
      copyBtn.textContent = "Copied!";
      setTimeout(() => {
        copyBtn.textContent = "Copy";
      }, 2000);
    });

    const deleteBtn = actionsEl.createEl("button", {
      text: "Delete",
      cls: "goliath-action-btn",
    });
    deleteBtn.style.fontSize = "11px";
    deleteBtn.style.padding = "2px 8px";
    deleteBtn.style.background = "transparent";
    deleteBtn.style.border = "1px solid var(--background-modifier-border)";
    deleteBtn.style.borderRadius = "4px";
    deleteBtn.style.color = "var(--text-muted)";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.addEventListener("click", () => {
      const index = this.messages.findIndex((m) => m.id === message.id);
      if (index >= 0) {
        this.messages.splice(index, 1);
        messageEl.remove();
      }
    });

    messageEl.addEventListener("mouseenter", () => {
      actionsEl.style.opacity = "1";
    });
    messageEl.addEventListener("mouseleave", () => {
      actionsEl.style.opacity = "0";
    });
  }

  private injectStreamStyles(): void {
    if (this.streamStyleInjected) return;
    this.streamStyleInjected = true;

    const style = document.createElement("style");
    style.textContent = `
      .goliath-streaming-indicator {
        display: flex;
        gap: 4px;
        padding: 8px 0 4px;
        align-items: center;
      }
      .goliath-streaming-indicator span {
        width: 6px;
        height: 6px;
        background-color: var(--text-muted);
        border-radius: 50%;
        display: inline-block;
        animation: goliath-pulse 1.4s infinite ease-in-out both;
      }
      .goliath-streaming-indicator span:nth-child(1) { animation-delay: -0.32s; }
      .goliath-streaming-indicator span:nth-child(2) { animation-delay: -0.16s; }
      @keyframes goliath-pulse {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }

  private scrollToBottom(): void {
    if (this.messageContainer) {
      this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }
  }

  private updateSendButtonState(): void {
    if (!this.sendButton || !this.inputElement) return;
    const canSend =
      this.inputElement.value.trim().length > 0 && !this.isStreaming && !!this.chatCore;
    this.sendButton.disabled = !canSend;
    this.sendButton.style.backgroundColor = canSend
      ? "var(--interactive-accent)"
      : "var(--background-modifier-border-hover)";
  }
}
