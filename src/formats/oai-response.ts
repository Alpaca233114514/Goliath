import { FileContext } from "../api/types";
import { FormatOptions, FormattedOutput } from "./types";

interface ResponseInputItem {
  type: "message" | "file";
  role?: "system" | "user" | "assistant";
  content?: string | Array<{ type: string; text?: string }>;
  file_path?: string;
  file_content?: string;
}

export function generateOaiResponseFormat(
  contexts: FileContext[],
  options: FormatOptions
): FormattedOutput {
  const input: ResponseInputItem[] = [];

  if (options.systemPrompt) {
    input.push({
      type: "message",
      role: "system",
      content: options.systemPrompt,
    });
  }

  for (const context of contexts) {
    input.push({
      type: "file",
      file_path: context.path,
      file_content: context.content,
    });
  }

  const userParts: Array<{ type: string; text?: string }> = [];
  if (options.userQuery) {
    userParts.push({ type: "input_text", text: options.userQuery });
  }

  if (userParts.length > 0) {
    input.push({
      type: "message",
      role: "user",
      content: userParts,
    });
  }

  const response = {
    model: "gpt-4o",
    input,
    tools: [],
  };

  return {
    format: "oai-response",
    content: JSON.stringify(response, null, 2),
    metadata: response,
  };
}
