import { App, Modal, Notice, TFile } from "obsidian";
import { ExportFormat, GoliathSettings } from "../settings";
import { FileContext } from "../api/types";
import { generateClaudeCodeFormat } from "../formats/claude-code";
import { generateKimiCodeFormat } from "../formats/kimi-code";
import { generateKimiStreamJsonFormat } from "../formats/kimi-stream-json";
import { generateOaiChatFormat } from "../formats/oai-chat";
import { generateOaiResponseFormat } from "../formats/oai-response";
import { t, formatTemplate } from "../i18n";

export class ExportModal extends Modal {
  private settings: GoliathSettings;
  private contexts: FileContext[];
  private onExport?: (text: string, format: ExportFormat) => void;

  constructor(
    app: App,
    settings: GoliathSettings,
    contexts: FileContext[],
    onExport?: (text: string, format: ExportFormat) => void
  ) {
    super(app);
    this.settings = settings;
    this.contexts = contexts;
    this.onExport = onExport;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("goliath-export-modal");

    const i18n = t();
    contentEl.createEl("h2", { text: i18n.ui.exportTitle });

    const formatContainer = contentEl.createDiv({
      cls: "goliath-format-list",
    });

    for (const format of Object.keys(i18n.ui.exportFormatNames) as ExportFormat[]) {
      const button = formatContainer.createEl("button", {
        text: i18n.ui.exportFormatNames[format],
        cls: "mod-cta",
      });
      button.style.marginBottom = "8px";
      button.style.display = "block";
      button.style.width = "100%";
      button.addEventListener("click", () => this.exportFormat(format));
    }

    const cancelButton = contentEl.createEl("button", { text: i18n.ui.cancel });
    cancelButton.style.marginTop = "12px";
    cancelButton.addEventListener("click", () => this.close());
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  private exportFormat(format: ExportFormat): void {
    const options = {
      includeFrontmatter: this.settings.includeFrontmatter,
      systemPrompt: this.settings.systemPrompt,
    };

    let result: { content: string };

    switch (format) {
      case "claude-code":
        result = generateClaudeCodeFormat(this.contexts, options);
        break;
      case "kimi-code":
        result = generateKimiCodeFormat(this.contexts, options);
        break;
      case "kimi-stream-json":
        result = generateKimiStreamJsonFormat(this.contexts, options);
        break;
      case "oai-chat":
        result = generateOaiChatFormat(this.contexts, options);
        break;
      case "oai-response":
        result = generateOaiResponseFormat(this.contexts, options);
        break;
      default:
        result = generateClaudeCodeFormat(this.contexts, options);
    }

    const i18n = t();
    const formatName = i18n.ui.exportFormatNames[format] ?? format;

    if (this.onExport) {
      this.onExport(result.content, format);
    } else {
      navigator.clipboard.writeText(result.content);
      new Notice(formatTemplate(i18n.ui.copiedToClipboard, { format: formatName }));
    }

    this.close();
  }
}
