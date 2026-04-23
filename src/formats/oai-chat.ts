import { Message } from "../api/types";
import { FileContext } from "../api/types";
import { FormatOptions, FormattedOutput } from "./types";

export function generateOaiChatFormat(
  contexts: FileContext[],
  options: FormatOptions
): FormattedOutput {
  const messages: Message[] = [];

  if (options.systemPrompt) {
    messages.push({
      role: "system",
      content: options.systemPrompt,
    });
  }

  const contextContent = contexts
    .map((ctx) => `File: ${ctx.path}\n\`\`\`\n${ctx.content}\n\`\`\``)
    .join("\n\n");

  let userContent = contextContent;
  if (options.userQuery) {
    userContent += `\n\n${options.userQuery}`;
  }

  messages.push({
    role: "user",
    content: userContent,
  });

  return {
    format: "oai-chat",
    content: JSON.stringify({ messages }, null, 2),
    metadata: { messages },
  };
}
