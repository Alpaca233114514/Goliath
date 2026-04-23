import { ChatCore } from "../../src/core/chat-core";
import { ToolRegistry } from "../../src/core/tools/registry";
import { ApiClient, ChatResponse, Message } from "../../src/api/types";
import { App } from "obsidian";

const mockApp = new App();

function createMockApiClient(
  responses: ChatResponse[]
): ApiClient {
  let callIndex = 0;
  return {
    chat: jest.fn().mockImplementation(() => {
      const response = responses[callIndex++] ?? { content: "" };
      return Promise.resolve(response);
    }),
    streamChat: jest.fn().mockImplementation(
      (_request, onChunk) => {
        const response = responses[callIndex++] ?? { content: "" };
        if (onChunk && response.content) {
          onChunk(response.content);
        }
        return Promise.resolve(response);
      }
    ),
  };
}

describe("ChatCore", () => {
  it("streams normal chat response without tools", async () => {
    const client = createMockApiClient([{ content: "Hello!" }]);
    const core = new ChatCore({
      apiClient: client,
      toolRegistry: new ToolRegistry(),
      app: mockApp,
    });

    const chunks: string[] = [];
    const result = await core.sendMessage(
      [{ role: "user", content: "Hi" }],
      (chunk) => chunks.push(chunk)
    );

    expect(result.content).toBe("Hello!");
    expect(chunks).toEqual(["Hello!"]);
    expect(client.streamChat).toHaveBeenCalledTimes(1);
  });

  it("executes tool calls and returns results", async () => {
    const toolRegistry = new ToolRegistry();
    toolRegistry.register(
      {
        name: "echo",
        description: "Echo tool",
        parameters: { type: "object", properties: {} },
      },
      async (args) => `Echo: ${args.text}`
    );

    const client = createMockApiClient([
      {
        content: "",
        toolCalls: [
          { id: "tc1", name: "echo", arguments: { text: "world" } },
        ],
      },
      { content: "Done!" },
    ]);

    const core = new ChatCore({
      apiClient: client,
      toolRegistry,
      app: mockApp,
    });

    const result = await core.sendMessage([
      { role: "user", content: "Test" },
    ]);

    expect(result.content).toBe("Done!");
    expect(result.toolResults).toHaveLength(1);
    expect(result.toolResults?.[0].content).toBe("Echo: world");
    expect(client.chat).toHaveBeenCalledTimes(2);
  });

  it("respects maxToolIterations limit", async () => {
    const toolRegistry = new ToolRegistry();
    toolRegistry.register(
      {
        name: "loop",
        description: "Loops forever",
        parameters: { type: "object", properties: {} },
      },
      async () => "again"
    );

    const client = createMockApiClient(
      Array.from({ length: 10 }, () => ({
        content: "",
        toolCalls: [{ id: "tc", name: "loop", arguments: {} }],
      }))
    );

    const core = new ChatCore({
      apiClient: client,
      toolRegistry,
      app: mockApp,
      maxToolIterations: 3,
    });

    const result = await core.sendMessage([
      { role: "user", content: "Loop" },
    ]);

    expect(result.content).toContain("maximum tool iterations");
    expect(result.toolResults?.length).toBeLessThanOrEqual(3);
  });

  it("handles tool execution errors gracefully", async () => {
    const toolRegistry = new ToolRegistry();
    toolRegistry.register(
      {
        name: "fail",
        description: "Always fails",
        parameters: { type: "object", properties: {} },
      },
      async () => {
        throw new Error("tool error");
      }
    );

    const client = createMockApiClient([
      {
        content: "",
        toolCalls: [{ id: "tc1", name: "fail", arguments: {} }],
      },
      { content: "Handled." },
    ]);

    const core = new ChatCore({
      apiClient: client,
      toolRegistry,
      app: mockApp,
    });

    const result = await core.sendMessage([
      { role: "user", content: "Fail" },
    ]);

    expect(result.toolResults?.[0].isError).toBe(true);
    expect(result.content).toBe("Handled.");
  });
});
