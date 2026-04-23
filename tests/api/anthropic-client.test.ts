import { AnthropicClient } from "../../src/api/anthropic-client";

describe("AnthropicClient", () => {
  const client = new AnthropicClient(
    "test-key",
    "https://api.anthropic.com",
    "claude-test"
  );

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("sends correct request format", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ type: "text", text: "Hello" }],
        usage: { input_tokens: 10, output_tokens: 5 },
      }),
    });

    const result = await client.chat({
      messages: [
        { role: "system", content: "You are helpful" },
        { role: "user", content: "Hi" },
      ],
    });

    expect(result.content).toBe("Hello");
    expect(result.usage).toEqual({ inputTokens: 10, outputTokens: 5 });

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.model).toBe("claude-test");
    expect(body.system).toBe("You are helpful");
    expect(body.messages).toEqual([{ role: "user", content: "Hi" }]);
    expect(body.max_tokens).toBe(4096);
  });

  it("uses custom max tokens", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ type: "text", text: "" }],
      }),
    });

    await client.chat({
      messages: [{ role: "user", content: "Hi" }],
      maxTokens: 2048,
    });

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.max_tokens).toBe(2048);
  });

  it("throws on API error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: async () => "Invalid API key",
    });

    await expect(
      client.chat({ messages: [{ role: "user", content: "Hi" }] })
    ).rejects.toThrow("API error 401 (Unauthorized): Invalid API key");
  });

  it("streams response chunks", async () => {
    const encoder = new TextEncoder();
    const chunks = [
      'data: {"type":"content_block_delta","delta":{"text":"Hello"}}\n\n',
      'data: {"type":"content_block_delta","delta":{"text":" world"}}\n\n',
      "data: [DONE]\n\n",
    ];

    let chunkIndex = 0;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      body: {
        getReader: () => ({
          read: jest.fn().mockImplementation(() => {
            if (chunkIndex < chunks.length) {
              return Promise.resolve({
                done: false,
                value: encoder.encode(chunks[chunkIndex++]),
              });
            }
            return Promise.resolve({ done: true });
          }),
        }),
      },
    });

    const receivedChunks: string[] = [];
    const result = await client.streamChat(
      { messages: [{ role: "user", content: "Hi" }] },
      (chunk) => receivedChunks.push(chunk)
    );

    expect(receivedChunks).toEqual(["Hello", " world"]);
    expect(result.content).toBe("Hello world");
  });

  it("handles empty stream", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      body: {
        getReader: () => ({
          read: jest.fn().mockResolvedValue({ done: true }),
        }),
      },
    });

    const result = await client.streamChat(
      { messages: [{ role: "user", content: "Hi" }] },
      jest.fn()
    );

    expect(result.content).toBe("");
  });

  it("throws when stream body is missing", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      body: null,
    });

    await expect(
      client.streamChat(
        { messages: [{ role: "user", content: "Hi" }] },
        jest.fn()
      )
    ).rejects.toThrow("Response body is not readable");
  });

  it("ignores malformed stream chunks", async () => {
    const encoder = new TextEncoder();
    const chunks = [
      'data: not-json\n\n',
      'data: {"type":"content_block_delta","delta":{"text":"ok"}}\n\n',
    ];

    let chunkIndex = 0;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      body: {
        getReader: () => ({
          read: jest.fn().mockImplementation(() => {
            if (chunkIndex < chunks.length) {
              return Promise.resolve({
                done: false,
                value: encoder.encode(chunks[chunkIndex++]),
              });
            }
            return Promise.resolve({ done: true });
          }),
        }),
      },
    });

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const receivedChunks: string[] = [];
    const result = await client.streamChat(
      { messages: [{ role: "user", content: "Hi" }] },
      (chunk) => receivedChunks.push(chunk)
    );

    expect(receivedChunks).toEqual(["ok"]);
    expect(result.content).toBe("ok");
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("serializes tools in request", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ type: "text", text: "" }],
      }),
    });

    await client.chat({
      messages: [{ role: "user", content: "Search" }],
      tools: [
        {
          name: "search_vault",
          description: "Search notes",
          parameters: { type: "object", properties: {} },
        },
      ],
    });

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.tools).toEqual([
      {
        name: "search_vault",
        description: "Search notes",
        input_schema: { type: "object", properties: {} },
      },
    ]);
  });

  it("serializes tool result messages", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ type: "text", text: "Done" }],
      }),
    });

    await client.chat({
      messages: [
        { role: "user", content: "Search" },
        {
          role: "tool",
          content: "Found 3 results",
          toolCallId: "tool-1",
        },
      ],
    });

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.messages).toEqual([
      { role: "user", content: "Search" },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "tool-1",
            content: "Found 3 results",
          },
        ],
      },
    ]);
  });

  it("serializes assistant messages with tool calls", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ type: "text", text: "" }],
      }),
    });

    await client.chat({
      messages: [
        { role: "user", content: "Search" },
        {
          role: "assistant",
          content: "I'll search for you",
          toolCalls: [
            { id: "tool-1", name: "search_vault", arguments: { query: "test" } },
          ],
        },
      ],
    });

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.messages).toEqual([
      { role: "user", content: "Search" },
      {
        role: "assistant",
        content: [
          { type: "text", text: "I'll search for you" },
          { type: "tool_use", id: "tool-1", name: "search_vault", input: { query: "test" } },
        ],
      },
    ]);
  });

  it("parses tool_use blocks from response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [
          { type: "text", text: "I'll search" },
          { type: "tool_use", id: "call-1", name: "search_vault", input: { query: "hello" } },
        ],
      }),
    });

    const result = await client.chat({
      messages: [{ role: "user", content: "Search" }],
    });

    expect(result.content).toBe("I'll search");
    expect(result.toolCalls).toEqual([
      { id: "call-1", name: "search_vault", arguments: { query: "hello" } },
    ]);
  });

  it("filters non-text blocks from content", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [
          { type: "text", text: "Hello" },
          { type: "tool_use", id: "x", name: "x", input: {} },
        ],
      }),
    });

    const result = await client.chat({
      messages: [{ role: "user", content: "Hi" }],
    });

    expect(result.content).toBe("Hello");
  });
});
