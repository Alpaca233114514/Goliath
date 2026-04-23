import { App, Modal, Notice, Platform } from "obsidian";
import {
  loginKimiCode,
  saveTokens,
  type OAuthEvent,
  type KimiTokens,
} from "../auth/kimi-oauth";
import { t } from "../i18n";

export class KimiLoginModal extends Modal {
  private deviceId: string;
  private onSuccess?: (tokens: KimiTokens) => void;
  private abortController = new AbortController();
  private statusEl: HTMLElement;
  private userCodeEl: HTMLElement;
  private linkEl: HTMLAnchorElement | null = null;

  constructor(
    app: App,
    deviceId: string,
    onSuccess?: (tokens: KimiTokens) => void
  ) {
    super(app);
    this.deviceId = deviceId;
    this.onSuccess = onSuccess;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("goliath-kimi-login-modal");

    contentEl.createEl("h2", { text: "Kimi Login" });

    const codeContainer = contentEl.createDiv({
      cls: "kimi-user-code-container",
    });
    codeContainer.style.marginBottom = "16px";
    codeContainer.createEl("p", {
      text: "Verification code:",
      cls: "kimi-code-label",
    });
    this.userCodeEl = codeContainer.createEl("code", {
      text: "Loading...",
      cls: "kimi-user-code",
    });
    this.userCodeEl.style.fontSize = "1.5em";
    this.userCodeEl.style.padding = "8px 16px";
    this.userCodeEl.style.backgroundColor = "var(--background-primary-alt)";
    this.userCodeEl.style.borderRadius = "6px";
    this.userCodeEl.style.display = "inline-block";
    this.userCodeEl.style.fontFamily = "monospace";

    this.statusEl = contentEl.createEl("p", {
      text: "Requesting device code...",
      cls: "kimi-login-status",
    });
    this.statusEl.style.marginTop = "12px";
    this.statusEl.style.color = "var(--text-muted)";

    const buttonContainer = contentEl.createDiv();
    buttonContainer.style.marginTop = "16px";
    const cancelButton = buttonContainer.createEl("button", {
      text: t().ui.cancel,
    });
    cancelButton.addEventListener("click", () => this.close());

    this.startLoginFlow().catch(() => {
      // Errors are handled in the flow
    });
  }

  onClose(): void {
    this.abortController.abort();
    const { contentEl } = this;
    contentEl.empty();
  }

  private async startLoginFlow(): Promise<void> {
    const generator = loginKimiCode(this.deviceId, {
      openBrowser: (url) => {
        if (Platform.isDesktop) {
          try {
            window.open(url, "_blank");
          } catch {
            // Ignore browser open errors
          }
        }
      },
    });

    try {
      let eventValue: OAuthEvent | undefined;
      while (true) {
        if (this.abortController.signal.aborted) {
          await generator.return(undefined as unknown as KimiTokens);
          break;
        }

        const result = await generator.next();
        if (result.done) {
          const tokens = result.value as KimiTokens;
          await this.handleSuccess(tokens);
          break;
        }

        eventValue = result.value as OAuthEvent;
        this.handleEvent(eventValue);
      }
    } catch (error) {
      if (!this.abortController.signal.aborted) {
        const message =
          error instanceof Error ? error.message : String(error);
        this.statusEl.setText(`Login failed: ${message}`);
        this.statusEl.style.color = "var(--text-error)";
        new Notice(`Kimi login failed: ${message}`);
      }
    }
  }

  private handleEvent(event: OAuthEvent): void {
    switch (event.type) {
      case "verification_url": {
        const userCode = String(event.data?.user_code ?? "");
        const verificationUrl = String(event.data?.verification_url ?? "");
        if (userCode) {
          this.userCodeEl.setText(userCode);
        }
        if (verificationUrl) {
          this.statusEl.empty();
          this.statusEl.appendText("Open this URL to authorize: ");
          this.linkEl = this.statusEl.createEl("a", {
            text: verificationUrl,
            href: verificationUrl,
          });
          this.linkEl.target = "_blank";
          this.statusEl.style.color = "var(--text-accent)";
        }
        break;
      }
      case "waiting": {
        if (!this.linkEl) {
          this.statusEl.setText(event.message);
        }
        break;
      }
      case "success": {
        this.statusEl.setText("Login successful!");
        this.statusEl.style.color = "var(--text-success)";
        break;
      }
      case "error": {
        this.statusEl.setText(event.message);
        this.statusEl.style.color = "var(--text-error)";
        break;
      }
      case "info":
      default: {
        if (!this.linkEl) {
          this.statusEl.setText(event.message);
        }
      }
    }
  }

  private async handleSuccess(tokens: KimiTokens): Promise<void> {
    new Notice("Kimi login successful!");
    if (this.onSuccess) {
      this.onSuccess(tokens);
    }
    this.close();
  }
}

export async function startKimiLogin(
  app: App,
  deviceId: string,
  saveToStorage: (tokens: KimiTokens) => Promise<void>
): Promise<void> {
  return new Promise((resolve, reject) => {
    const modal = new KimiLoginModal(app, deviceId, async (tokens) => {
      try {
        await saveToStorage(tokens);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
    modal.open();
  });
}
