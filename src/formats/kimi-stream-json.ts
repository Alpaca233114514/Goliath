import { FileContext } from "../api/types";
import { FormatOptions, FormattedOutput } from "./types";

interface KimiMessage {
  role: "user";
  content: string;
}

export function generateKimiStreamJsonFormat(
  contexts: FileContext[],
  options: FormatOptions
): FormattedOutput {
  const parts: string[] = [];

  if (options.systemPrompt) {
    parts.push(options.systemPrompt);
  }

  for (const context of contexts) {
    const ext = context.path.split(".").pop() ?? "";
    const lang = ext ? `${ext}\n` : "\n";
    parts.push(
      `File: ${context.path}\n\`\`\`${lang}${context.content}\n\`\`\``
    );
  }

  if (options.userQuery) {
    parts.push(options.userQuery);
  }

  const message: KimiMessage = {
    role: "user",
    content: parts.join("\n\n"),
  };

  return {
    format: "kimi-stream-json",
    content: JSON.stringify(message),
  };
}
