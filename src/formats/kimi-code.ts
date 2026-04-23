import { FileContext } from "../api/types";
import { FormatOptions, FormattedOutput } from "./types";

export function generateKimiCodeFormat(
  contexts: FileContext[],
  options: FormatOptions
): FormattedOutput {
  const parts: string[] = [];

  if (options.systemPrompt) {
    parts.push(`# System\n${options.systemPrompt}`);
  }

  for (const context of contexts) {
    parts.push(
      `---\n## File: ${context.path}\n\`\`\`\n${context.content}\n\`\`\``
    );
  }

  if (options.userQuery) {
    parts.push(`---\n## Question\n${options.userQuery}`);
  }

  return {
    format: "kimi-code",
    content: parts.join("\n\n"),
  };
}
