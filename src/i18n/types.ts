export interface Translations {
  pluginName: string;
  pluginDescription: string;

  settings: {
    title: string;
    defaultProvider: string;
    defaultProviderDesc: string;
    defaultFormat: string;
    defaultFormatDesc: string;
    systemPrompt: string;
    systemPromptDesc: string;
    includeFrontmatter: string;
    includeFrontmatterDesc: string;
    includeLinkedNotes: string;
    includeLinkedNotesDesc: string;
    maxLinkedDepth: string;
    maxLinkedDepthDesc: string;
    apiProviders: string;
    enabled: string;
    apiKey: string;
    apiKeyDesc: string;
    baseUrl: string;
    baseUrlDesc: string;
    model: string;
    modelDesc: string;
    language: string;
    languageDesc: string;
  };

  commands: {
    openChat: string;
    exportNote: string;
    chatWithNote: string;
  };

  ui: {
    exportTitle: string;
    cancel: string;
    copiedToClipboard: string;
    chatPlaceholder: string;
    send: string;
    sending: string;
    chatViewTitle: string;
    noActiveNote: string;
    providerNotConfigured: string;
    exportFormatNames: Record<string, string>;
    providerNames: Record<string, string>;
    kimiLoginSuccess: string;
    kimiLoginFailed: string;
    kimiLogoutSuccess: string;
  };

  errors: {
    apiError: string;
    responseNotReadable: string;
  };
}
