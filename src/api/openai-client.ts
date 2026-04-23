import { BaseApiClient } from "./base-client";
import { ChatRequest, ChatResponse, Message, ToolCall } from "./types";

interface OpenAiMessage {
  role: string;
  content: string;
  tool_calls?: OpenAiToolCall[];
  tool_call_id?: string;
}

interface OpenAiToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

interface OpenAiToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface OpenAiRequest {
  model: string;
  messages: OpenAiMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  tools?: OpenAiToolDefinition[];
}

interface OpenAiChoice {
  message?: {
    content?: string | null;
    tool_calls?: OpenAiToolCall[];
  };
  delta?: {
    content?: string | null;
    tool_calls?: OpenAiToolCall[];
  };
}

interface OpenAiResponse {
  choices?: OpenAiChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export class OpenAiClient extends BaseApiClient {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const openAiRequest = this.toOpenAiRequest(request);
    const response = await this.post(
      `${this.baseUrl}/chat/completions`,
      openAiRequest
    );
    const data = (await response.json()) as OpenAiResponse;

    const message = data.choices?.[0]?.message;
    const toolCalls = this.parseToolCalls(message?.tool_calls);

    return {
      content: message?.content ?? "",
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage: data.usage
        ? {
            inputTokens: data.usage.prompt_tokens,
            outputTokens: data.usage.completion_tokens,
          }
        : undefined,
    };
  }

  async streamChat(
    request: ChatRequest,
    onChunk: (chunk: string) => void
  ): Promise<ChatResponse> {
    const openAiRequest = this.toOpenAiRequest(request);
    openAiRequest.stream = true;

    const response = await this.post(
      `${this.baseUrl}/chat/completions`,
      openAiRequest
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
          const parsed = JSON.parse(data) as OpenAiResponse;
          const text = parsed.choices?.[0]?.delta?.content ?? "";
          if (text) {
            fullText += text;
            onChunk(text);
          }
        } catch (parseError) {
          console.error("[Goliath] Failed to parse OpenAI stream chunk:", {
            line: data,
            error: parseError instanceof Error ? parseError.message : String(parseError),
          });
        }
      }
    }

    return { content: fullText };
  }

  private toOpenAiRequest(request: ChatRequest): OpenAiRequest {
    const result: OpenAiRequest = {
      model: this.model,
      messages: request.messages.map((m) => this.toOpenAiMessage(m)),
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 4096,
    };

    if (request.tools && request.tools.length > 0) {
      result.tools = request.tools.map((tool) => ({
        type: "function" as const,
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
      }));
    }

    return result;
  }

  private toOpenAiMessage(message: Message): OpenAiMessage {
    const result: OpenAiMessage = {
      role: message.role,
      content: message.content,
    };

    if (message.toolCalls && message.toolCalls.length > 0) {
      result.tool_calls = message.toolCalls.map((tc) => ({
        id: tc.id,
        type: "function",
        function: {
          name: tc.name,
          arguments: JSON.stringify(tc.arguments),
        },
      }));
    }

    if (message.toolCallId) {
      result.tool_call_id = message.toolCallId;
    }

    return result;
  }

  private parseToolCalls(
    toolCalls: OpenAiToolCall[] | undefined
  ): ToolCall[] {
    if (!toolCalls) return [];

    return toolCalls
      .filter((tc) => tc.type === "function")
      .map((tc) => {
        let args: Record<string, unknown>;
        try {
          args = JSON.parse(tc.function.arguments);
        } catch {
          args = {};
        }
        return {
          id: tc.id,
          name: tc.function.name,
          arguments: args,
        };
      });
  }
}
