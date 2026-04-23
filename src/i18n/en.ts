import { Translations } from "./types";

export const en: Translations = {
  pluginName: "Goliath",
  pluginDescription:
    "Bridge Obsidian notes to AI coding tools and APIs. Support Claude Code, Kimi Code CLI, OpenAI formats, and multiple API providers.",

  settings: {
    title: "Goliath Settings",
    defaultProvider: "Default API Provider",
    defaultProviderDesc: "The AI provider to use for chat",
    defaultFormat: "Default Export Format",
    defaultFormatDesc: "The format used when exporting prompts",
    systemPrompt: "System Prompt",
    systemPromptDesc: "The default system prompt used for AI conversations",
    includeFrontmatter: "Include Frontmatter",
    includeFrontmatterDesc: "Include note frontmatter when building context",
    includeLinkedNotes: "Include Linked Notes",
    includeLinkedNotesDesc: "Include linked notes when building context",
    maxLinkedDepth: "Max Linked Depth",
    maxLinkedDepthDesc: "How many levels of linked notes to include",
    apiProviders: "API Providers",
    enabled: "Enabled",
    apiKey: "API Key",
    apiKeyDesc: "Your API key for this provider",
    baseUrl: "Base URL",
    baseUrlDesc: "The API base URL (usually does not need to be changed)",
    model: "Model",
    modelDesc: "The model to use",
    language: "Language",
    languageDesc: "Interface language",
  },

  commands: {
    openChat: "Open Chat",
    exportNote: "Export Current Note as Prompt",
    chatWithNote: "Chat with Current Note",
  },

  ui: {
    exportTitle: "Export as Prompt",
    cancel: "Cancel",
    copiedToClipboard: "Copied {format} format to clipboard",
    chatPlaceholder: "Ask a question...",
    send: "Send",
    sending: "...",
    chatViewTitle: "Goliath Chat",
    noActiveNote: "No active note",
    providerNotConfigured: "{provider} is not configured or enabled",
    exportFormatNames: {
      "claude-code": "Claude Code",
      "kimi-code": "Kimi Code CLI",
      "kimi-stream-json": "Kimi Stream JSON",
      "oai-chat": "OpenAI Chat Completions",
      "oai-response": "OpenAI Response API",
    },
    providerNames: {
      anthropic: "Anthropic",
      gemini: "Google Gemini",
      kimi: "Kimi (Moonshot AI)",
      local: "Local API (OpenAI compatible)",
    },
    kimiLoginSuccess: "Kimi login successful!",
    kimiLoginFailed: "Kimi login failed.",
    kimiLogoutSuccess: "Logged out from Kimi.",
  },

  errors: {
    apiError: "API error {status}: {message}",
    responseNotReadable: "Response body is not readable",
  },
};
