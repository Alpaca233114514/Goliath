import { App } from "obsidian";
import {
  ApiClient,
  ChatRequest,
  ChatResponse,
  Message,
  ToolCall,
  ToolResult,
} from "../api/types";
import { ToolRegistry } from "./tools/registry";
import { ToolExtras } from "./tools/types";

export interface ChatCoreOptions {
  apiClient: ApiClient;
  toolRegistry: ToolRegistry;
  app: App;
  maxToolIterations?: number;
}

export class ChatCore {
  private apiClient: ApiClient;
  private toolRegistry: ToolRegistry;
  private toolExtras: ToolExtras;
  private maxToolIterations: number;

  constructor(options: ChatCoreOptions) {
    this.apiClient = options.apiClient;
    this.toolRegistry = options.toolRegistry;
    this.toolExtras = { app: options.app };
    this.maxToolIterations = options.maxToolIterations ?? 5;
  }

  async sendMessage(
    messages: Message[],
    onStreamChunk?: (chunk: string) => void
  ): Promise<{
    content: string;
    toolCalls?: ToolCall[];
    toolResults?: ToolResult[];
  }> {
    const toolDefinitions = this.toolRegistry.getDefinitions();
    const request: ChatRequest = {
      messages,
      temperature: 0.7,
      maxTokens: 4096,
      tools: toolDefinitions.length > 0 ? toolDefinitions : undefined,
    };

    const allToolResults: ToolResult[] = [];
    let toolCallCount = 0;

    while (true) {
      let response: ChatResponse;

      if (toolCallCount === 0 && !request.tools) {
        response = await this.apiClient.streamChat(request, (chunk) => {
          onStreamChunk?.(chunk);
        });
      } else {
        response = await this.apiClient.chat(request);
      }

      if (!response.toolCalls || response.toolCalls.length === 0) {
        return {
          content: response.content,
          toolResults:
            allToolResults.length > 0 ? allToolResults : undefined,
        };
      }

      if (toolCallCount >= this.maxToolIterations) {
        return {
          content:
            "Reached maximum tool iterations. Here are the results:\n\n" +
            allToolResults.map((r) => `${r.name}: ${r.content}`).join("\n\n"),
          toolResults: allToolResults,
        };
      }

      toolCallCount++;
      const toolResults = await this.executeToolCalls(response.toolCalls);
      allToolResults.push(...toolResults);

      request.messages = [
        ...request.messages,
        {
          role: "assistant",
          content: response.content,
          toolCalls: response.toolCalls,
        },
        ...toolResults.map((result) => ({
          role: "tool" as const,
          content: result.content,
          toolCallId: result.toolCallId,
        })),
      ];

      delete request.tools;
    }
  }

  private async executeToolCalls(
    toolCalls: ToolCall[]
  ): Promise<ToolResult[]> {
    const results: ToolResult[] = [];

    for (const toolCall of toolCalls) {
      const result = await this.toolRegistry.execute(
        toolCall.name,
        toolCall.arguments,
        this.toolExtras,
        toolCall.id
      );
      results.push(result);
    }

    return results;
  }
}
