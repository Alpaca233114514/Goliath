import { FileContext } from "../api/types";

export interface FormatOptions {
  includeFrontmatter: boolean;
  systemPrompt?: string;
  userQuery?: string;
}

export interface FormattedOutput {
  format: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export type FormatGenerator = (
  contexts: FileContext[],
  options: FormatOptions
) => FormattedOutput;

export interface ExportResult {
  text: string;
  format: string;
}
