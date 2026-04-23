import { FileContext } from "../api/types";
import { FormatOptions, FormattedOutput } from "./types";

export function generateClaudeCodeFormat(
  contexts: FileContext[],
  options: FormatOptions
): FormattedOutput {
  const parts: string[] = [];

  if (options.systemPrompt) {
    parts.push(`<system>${options.systemPrompt}</system>`);
  }

  for (const context of contexts) {
    const ext = context.path.split(".").pop() ?? "";
    parts.push(
      `<file path="${context.path}">\n\`\`\`${ext}\n${context.content}\n\`\`\`\n</file>`
    );
  }

  if (options.userQuery) {
    parts.push(`<question>\n${options.userQuery}\n</question>`);
  }

  return {
    format: "claude-code",
    content: parts.join("\n\n"),
  };
}
