import { GeminiClient } from "../../src/api/gemini-client";

describe("GeminiClient", () => {
  const client = new GeminiClient(
    "test-key",
    "https://generativelanguage.googleapis.com",
    "gemini-test"
  );

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("sends correct request format", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: "Hello from Gemini" }],
            },
          },
        ],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 5,
        },
      }),
    });

    const result = await client.chat({
      messages: [
        { role: "system", content: "You are helpful" },
        { role: "user", content: "Hi" },
      ],
    });

    expect(result.content).toBe("Hello from Gemini");
    expect(result.usage).toEqual({ inputTokens: 10, outputTokens: 5 });

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.contents).toEqual([
      { role: "user", parts: [{ text: "Hi" }] },
    ]);
    expect(body.systemInstruction).toEqual({
      parts: [{ text: "You are helpful" }],
    });
  });

  it("maps assistant role to model", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: "" }] } }],
      }),
    });

    await client.chat({
      messages: [
        { role: "user", content: "Hi" },
        { role: "assistant", content: "Hello" },
        { role: "user", content: "Bye" },
      ],
    });

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.contents).toEqual([
      { role: "user", parts: [{ text: "Hi" }] },
      { role: "model", parts: [{ text: "Hello" }] },
      { role: "user", parts: [{ text: "Bye" }] },
    ]);
  });

  it("streams response chunks", async () => {
    const encoder = new TextEncoder();
    const chunks = [
      JSON.stringify({
        candidates: [{ content: { parts: [{ text: "Hello" }] } }],
      }) + "\n",
      JSON.stringify({
        candidates: [{ content: { parts: [{ text: " world" }] } }],
      }) + "\n",
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

  it("handles missing candidates and usage", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [],
      }),
    });

    const result = await client.chat({
      messages: [{ role: "user", content: "Hi" }],
    });

    expect(result.content).toBe("");
    expect(result.usage).toBeUndefined();
  });

  it("handles partial usage metadata", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: "Hi" }] } }],
        usageMetadata: {},
      }),
    });

    const result = await client.chat({
      messages: [{ role: "user", content: "Hi" }],
    });

    expect(result.usage).toEqual({ inputTokens: 0, outputTokens: 0 });
  });

  it("handles stream chunks with missing parts", async () => {
    const encoder = new TextEncoder();
    const chunks = [
      JSON.stringify({ candidates: [] }) + "\n",
      JSON.stringify({ candidates: [{ content: {} }] }) + "\n",
      JSON.stringify({ candidates: [{ content: { parts: [] } }] }) + "\n",
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

    const result = await client.streamChat(
      { messages: [{ role: "user", content: "Hi" }] },
      jest.fn()
    );

    expect(result.content).toBe("");
  });

  it("skips empty stream chunks", async () => {
    const encoder = new TextEncoder();
    const chunks = [
      JSON.stringify({
        candidates: [{ content: { parts: [{ text: "" }] } }],
      }) + "\n",
      JSON.stringify({
        candidates: [{ content: { parts: [{ text: "ok" }] } }],
      }) + "\n",
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
      'not-json\n',
      JSON.stringify({
        candidates: [{ content: { parts: [{ text: "ok" }] } }],
      }) + '\n',
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
});
