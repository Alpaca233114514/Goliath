import { OpenAiClient } from "../../src/api/openai-client";

describe("OpenAiClient", () => {
  const client = new OpenAiClient(
    "test-key",
    "http://localhost:1234/v1",
    "local-model"
  );

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("sends correct request format", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Hello from local" } }],
        usage: { prompt_tokens: 10, completion_tokens: 5 },
      }),
    });

    const result = await client.chat({
      messages: [
        { role: "system", content: "You are helpful" },
        { role: "user", content: "Hi" },
      ],
    });

    expect(result.content).toBe("Hello from local");
    expect(result.usage).toEqual({ inputTokens: 10, outputTokens: 5 });

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.model).toBe("local-model");
    expect(body.messages).toEqual([
      { role: "system", content: "You are helpful" },
      { role: "user", content: "Hi" },
    ]);
  });

  it("uses Bearer auth", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "" } }],
      }),
    });

    await client.chat({ messages: [{ role: "user", content: "Hi" }] });

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    expect(fetchCall[1].headers.Authorization).toBe("Bearer test-key");
  });

  it("streams response chunks", async () => {
    const encoder = new TextEncoder();
    const chunks = [
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
      "data: [DONE]\n\n",
    ];

    let chunkIndex = 0;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      body: {
        getReader: () =>
          ({
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

  it("handles missing stream body", async () => {
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
      'data: {"choices":[{"delta":{"content":"ok"}}]}\n\n',
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
        choices: [{ message: { content: "" } }],
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
        type: "function",
        function: {
          name: "search_vault",
          description: "Search notes",
          parameters: { type: "object", properties: {} },
        },
      },
    ]);
  });

  it("serializes assistant messages with tool calls", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "" } }],
      }),
    });

    await client.chat({
      messages: [
        {
          role: "assistant",
          content: "I'll search",
          toolCalls: [
            { id: "call-1", name: "search_vault", arguments: { query: "test" } },
          ],
        },
      ],
    });

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.messages).toEqual([
      {
        role: "assistant",
        content: "I'll search",
        tool_calls: [
          {
            id: "call-1",
            type: "function",
            function: {
              name: "search_vault",
              arguments: JSON.stringify({ query: "test" }),
            },
          },
        ],
      },
    ]);
  });

  it("serializes tool result messages", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "" } }],
      }),
    });

    await client.chat({
      messages: [
        {
          role: "tool",
          content: "Found 3 results",
          toolCallId: "call-1",
        },
      ],
    });

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.messages).toEqual([
      {
        role: "tool",
        content: "Found 3 results",
        tool_call_id: "call-1",
      },
    ]);
  });

  it("parses tool_calls from response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: "I'll search",
              tool_calls: [
                {
                  id: "call-1",
                  type: "function",
                  function: {
                    name: "search_vault",
                    arguments: JSON.stringify({ query: "hello" }),
                  },
                },
              ],
            },
          },
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

  it("handles empty choices and missing usage", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [],
      }),
    });

    const result = await client.chat({
      messages: [{ role: "user", content: "Hi" }],
    });

    expect(result.content).toBe("");
    expect(result.usage).toBeUndefined();
  });

  it("handles stream chunks with empty choices", async () => {
    const encoder = new TextEncoder();
    const chunks = [
      'data: {"choices":[]}\n\n',
      'data: {"choices":[{"delta":{}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"ok"}}]}\n\n',
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

    expect(receivedChunks).toEqual(["ok"]);
    expect(result.content).toBe("ok");
  });

  it("filters non-function tool_calls and handles invalid JSON", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: "",
              tool_calls: [
                {
                  id: "call-1",
                  type: "other",
                  function: { name: "x", arguments: "{}" },
                },
                {
                  id: "call-2",
                  type: "function",
                  function: { name: "broken", arguments: "not-json" },
                },
              ],
            },
          },
        ],
      }),
    });

    const result = await client.chat({
      messages: [{ role: "user", content: "Search" }],
    });

    expect(result.toolCalls).toEqual([
      { id: "call-2", name: "broken", arguments: {} },
    ]);
  });
});
