import { BaseApiClient } from "./base-client";
import { ChatRequest, ChatResponse } from "./types";

interface GeminiContent {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

interface GeminiRequest {
  contents: GeminiContent[];
  systemInstruction?: { parts: Array<{ text: string }> };
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

interface GeminiCandidate {
  content?: {
    parts?: Array<{ text?: string }>;
  };
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
  };
}

export class GeminiClient extends BaseApiClient {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const geminiRequest = this.toGeminiRequest(request);
    const response = await this.post(
      `${this.baseUrl}/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      geminiRequest
    );
    const data = (await response.json()) as GeminiResponse;

    const text =
      data.candidates?.[0]?.content?.parts
        ?.filter((part): part is { text: string } => typeof part.text === "string")
        .map((part) => part.text)
        .join("") ?? "";

    return {
      content: text,
      usage:
        data.usageMetadata
          ? {
              inputTokens: data.usageMetadata.promptTokenCount ?? 0,
              outputTokens: data.usageMetadata.candidatesTokenCount ?? 0,
            }
          : undefined,
    };
  }

  async streamChat(
    request: ChatRequest,
    onChunk: (chunk: string) => void
  ): Promise<ChatResponse> {
    const geminiRequest = this.toGeminiRequest(request);
    const response = await this.post(
      `${this.baseUrl}/v1beta/models/${this.model}:streamGenerateContent?key=${this.apiKey}`,
      geminiRequest
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
      const lines = chunk.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line) as GeminiResponse;
          const text =
            parsed.candidates?.[0]?.content?.parts
              ?.filter((part): part is { text: string } => typeof part.text === "string")
              .map((part) => part.text)
              .join("") ?? "";
          if (text) {
            fullText += text;
            onChunk(text);
          }
        } catch (parseError) {
          console.error("[Goliath] Failed to parse Gemini stream chunk:", {
            line,
            error: parseError instanceof Error ? parseError.message : String(parseError),
          });
        }
      }
    }

    return { content: fullText };
  }

  private toGeminiRequest(request: ChatRequest): GeminiRequest {
    const systemMessage = request.messages.find((m) => m.role === "system");
    const otherMessages = request.messages.filter((m) => m.role !== "system");

    const contents: GeminiContent[] = [];
    for (const message of otherMessages) {
      contents.push({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      });
    }

    const result: GeminiRequest = {
      contents,
      generationConfig: {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens ?? 4096,
      },
    };

    if (systemMessage) {
      result.systemInstruction = {
        parts: [{ text: systemMessage.content }],
      };
    }

    return result;
  }

  protected getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
    };
  }
}
