import { ApiClient, ChatRequest, ChatResponse } from "./types";

export abstract class BaseApiClient implements ApiClient {
  protected apiKey: string;
  protected baseUrl: string;
  protected model: string;

  constructor(apiKey: string, baseUrl: string, model: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.model = model;
  }

  abstract chat(request: ChatRequest): Promise<ChatResponse>;

  abstract streamChat(
    request: ChatRequest,
    onChunk: (chunk: string) => void
  ): Promise<ChatResponse>;

  protected async post(url: string, body: unknown): Promise<Response> {
    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "No error details");
      console.error(`[Goliath] API error: ${response.status} ${response.statusText}`, {
        url,
        model: this.model,
        status: response.status,
        body: errorText,
      });
      throw new Error(`API error ${response.status} (${response.statusText}): ${errorText}`);
    }

    return response;
  }

  protected getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }
}
