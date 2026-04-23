import { BaseApiClient } from "./base-client";
import { ChatRequest, ChatResponse, Message, ToolCall } from "./types";

interface AnthropicTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

interface AnthropicToolUse {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
}

interface AnthropicToolResult {
  type: "tool_result";
  tool_use_id: string;
  content: string;
}

interface AnthropicTextBlock {
  type: "text";
  text: string;
}

type AnthropicContentBlock = AnthropicTextBlock | AnthropicToolUse | AnthropicToolResult;

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string | AnthropicContentBlock[];
}

interface AnthropicRequest {
  model: string;
  max_tokens: number;
  messages: AnthropicMessage[];
  system?: string;
  temperature?: number;
  stream?: boolean;
  tools?: AnthropicTool[];
}

interface AnthropicResponse {
  content: AnthropicContentBlock[];
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class AnthropicClient extends BaseApiClient {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const anthropicRequest = this.toAnthropicRequest(request);
    const response = await this.post(
      `${this.baseUrl}/v1/messages`,
      anthropicRequest
    );
    const data = (await response.json()) as AnthropicResponse;

    const textBlocks = data.content.filter(
      (block): block is AnthropicTextBlock =>
        block.type === "text" && typeof block.text === "string"
    );
    const text = textBlocks.map((block) => block.text).join("");

    const toolCalls = this.parseToolCalls(data.content);

    return {
      content: text,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage: data.usage
        ? {
            inputTokens: data.usage.input_tokens,
            outputTokens: data.usage.output_tokens,
          }
        : undefined,
    };
  }

  async streamChat(
    request: ChatRequest,
    onChunk: (chunk: string) => void
  ): Promise<ChatResponse> {
    const anthropicRequest = this.toAnthropicRequest(request);
    anthropicRequest.stream = true;

    const response = await this.post(
      `${this.baseUrl}/v1/messages`,
      anthropicRequest
    );

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    let fullText = "";
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data) as {
            type: string;
            delta?: { text?: string };
          };
          if (parsed.type === "content_block_delta" && parsed.delta?.text) {
            fullText += parsed.delta.text;
            onChunk(parsed.delta.text);
          }
        } catch (parseError) {
          console.error("[Goliath] Failed to parse Anthropic stream chunk:", {
            line: data,
            error: parseError instanceof Error ? parseError.message : String(parseError),
          });
        }
      }
    }

    return { content: fullText };
  }

  private toAnthropicRequest(request: ChatRequest): AnthropicRequest {
    const systemMessage = request.messages.find((m) => m.role === "system");
    const otherMessages = request.messages.filter((m) => m.role !== "system");

    const result: AnthropicRequest = {
      model: this.model,
      max_tokens: request.maxTokens ?? 4096,
      messages: otherMessages.map((m) => this.toAnthropicMessage(m)),
      system: systemMessage?.content,
      temperature: request.temperature ?? 0.7,
    };

    if (request.tools && request.tools.length > 0) {
      result.tools = request.tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.parameters,
      }));
    }

    return result;
  }

  private toAnthropicMessage(message: Message): AnthropicMessage {
    if (message.role === "tool" && message.toolCallId) {
      return {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: message.toolCallId,
            content: message.content,
          },
        ],
      };
    }

    if (
      message.role === "assistant" &&
      message.toolCalls &&
      message.toolCalls.length > 0
    ) {
      const content: AnthropicContentBlock[] = [];
      if (message.content) {
        content.push({ type: "text", text: message.content });
      }
      for (const tc of message.toolCalls) {
        content.push({
          type: "tool_use",
          id: tc.id,
          name: tc.name,
          input: tc.arguments,
        });
      }
      return {
        role: "assistant",
        content,
      };
    }

    return {
      role: message.role as "user" | "assistant",
      content: message.content,
    };
  }

  private parseToolCalls(
    content: AnthropicContentBlock[]
  ): ToolCall[] {
    return content
      .filter((block): block is AnthropicToolUse => block.type === "tool_use")
      .map((block) => ({
        id: block.id,
        name: block.name,
        arguments: block.input,
      }));
  }

  protected getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
      "anthropic-version": "2023-06-01",
    };
  }
}
