export type ApiProvider = "anthropic" | "gemini" | "kimi" | "local";

export type ExportFormat =
  | "claude-code"
  | "kimi-code"
  | "kimi-stream-json"
  | "oai-chat"
  | "oai-response";

export interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  enabled: boolean;
}

export type Language = "en" | "zh";

export interface GoliathSettings {
  language: Language;
  defaultProvider: ApiProvider;
  defaultFormat: ExportFormat;
  anthropic: ProviderConfig;
  gemini: ProviderConfig;
  kimi: ProviderConfig;
  local: ProviderConfig;
  systemPrompt: string;
  includeFrontmatter: boolean;
  includeLinkedNotes: boolean;
  maxLinkedDepth: number;
}

export const DEFAULT_SETTINGS: GoliathSettings = {
  language: "zh",
  defaultProvider: "anthropic",
  defaultFormat: "claude-code",
  anthropic: {
    apiKey: "",
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-6",
    enabled: true,
  },
  gemini: {
    apiKey: "",
    baseUrl: "https://generativelanguage.googleapis.com",
    model: "gemini-2.5-pro",
    enabled: false,
  },
  kimi: {
    apiKey: "",
    baseUrl: "https://api.kimi.com",
    model: "kimi-latest",
    enabled: false,
  },
  local: {
    apiKey: "",
    baseUrl: "http://localhost:1234/v1",
    model: "local-model",
    enabled: false,
  },
  systemPrompt: "You are a helpful assistant. Use the provided context to answer questions.",
  includeFrontmatter: false,
  includeLinkedNotes: false,
  maxLinkedDepth: 1,
};
