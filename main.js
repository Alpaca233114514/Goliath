"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => GoliathPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian8 = require("obsidian");

// src/settings.ts
var DEFAULT_SETTINGS = {
  language: "zh",
  defaultProvider: "anthropic",
  defaultFormat: "claude-code",
  anthropic: {
    apiKey: "",
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-6",
    enabled: true
  },
  gemini: {
    apiKey: "",
    baseUrl: "https://generativelanguage.googleapis.com",
    model: "gemini-2.5-pro",
    enabled: false
  },
  kimi: {
    apiKey: "",
    baseUrl: "https://api.kimi.com",
    model: "kimi-latest",
    enabled: false
  },
  local: {
    apiKey: "",
    baseUrl: "http://localhost:1234/v1",
    model: "local-model",
    enabled: false
  },
  systemPrompt: "You are a helpful assistant. Use the provided context to answer questions.",
  includeFrontmatter: false,
  includeLinkedNotes: false,
  maxLinkedDepth: 1
};

// src/settings-tab.ts
var import_obsidian2 = require("obsidian");

// src/i18n/en.ts
var en = {
  pluginName: "Goliath",
  pluginDescription: "Bridge Obsidian notes to AI coding tools and APIs. Support Claude Code, Kimi Code CLI, OpenAI formats, and multiple API providers.",
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
    languageDesc: "Interface language"
  },
  commands: {
    openChat: "Open Chat",
    exportNote: "Export Current Note as Prompt",
    chatWithNote: "Chat with Current Note"
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
      "oai-response": "OpenAI Response API"
    },
    providerNames: {
      anthropic: "Anthropic",
      gemini: "Google Gemini",
      kimi: "Kimi (Moonshot AI)",
      local: "Local API (OpenAI compatible)"
    },
    kimiLoginSuccess: "Kimi login successful!",
    kimiLoginFailed: "Kimi login failed.",
    kimiLogoutSuccess: "Logged out from Kimi."
  },
  errors: {
    apiError: "API error {status}: {message}",
    responseNotReadable: "Response body is not readable"
  }
};

// src/i18n/zh.ts
var zh = {
  pluginName: "Goliath",
  pluginDescription: "\u8FDE\u63A5 Obsidian \u7B14\u8BB0\u4E0E AI \u7F16\u7A0B\u5DE5\u5177\u53CA API\u3002\u652F\u6301 Claude Code\u3001Kimi Code CLI\u3001OpenAI \u683C\u5F0F\u53CA\u591A\u79CD API \u670D\u52A1\u5546\u3002",
  settings: {
    title: "Goliath \u8BBE\u7F6E",
    defaultProvider: "\u9ED8\u8BA4 API \u670D\u52A1\u5546",
    defaultProviderDesc: "\u804A\u5929\u4F7F\u7528\u7684 AI \u670D\u52A1\u5546",
    defaultFormat: "\u9ED8\u8BA4\u5BFC\u51FA\u683C\u5F0F",
    defaultFormatDesc: "\u5BFC\u51FA\u63D0\u793A\u8BCD\u65F6\u4F7F\u7528\u7684\u683C\u5F0F",
    systemPrompt: "\u7CFB\u7EDF\u63D0\u793A\u8BCD",
    systemPromptDesc: "AI \u5BF9\u8BDD\u7684\u9ED8\u8BA4\u7CFB\u7EDF\u63D0\u793A\u8BCD",
    includeFrontmatter: "\u5305\u542B Frontmatter",
    includeFrontmatterDesc: "\u6784\u5EFA\u4E0A\u4E0B\u6587\u65F6\u5305\u542B\u7B14\u8BB0 frontmatter",
    includeLinkedNotes: "\u5305\u542B\u94FE\u63A5\u7B14\u8BB0",
    includeLinkedNotesDesc: "\u6784\u5EFA\u4E0A\u4E0B\u6587\u65F6\u5305\u542B\u94FE\u63A5\u7684\u7B14\u8BB0",
    maxLinkedDepth: "\u6700\u5927\u94FE\u63A5\u6DF1\u5EA6",
    maxLinkedDepthDesc: "\u94FE\u63A5\u8FFD\u8E2A\u7684\u5C42\u6570",
    apiProviders: "API \u670D\u52A1\u5546",
    enabled: "\u5DF2\u542F\u7528",
    apiKey: "API \u5BC6\u94A5",
    apiKeyDesc: "\u8BE5\u670D\u52A1\u5546\u7684 API \u5BC6\u94A5",
    baseUrl: "Base URL",
    baseUrlDesc: "API \u57FA\u7840\u5730\u5740\uFF08\u901A\u5E38\u65E0\u9700\u4FEE\u6539\uFF09",
    model: "\u6A21\u578B",
    modelDesc: "\u4F7F\u7528\u7684\u6A21\u578B\u540D\u79F0",
    language: "\u8BED\u8A00",
    languageDesc: "\u754C\u9762\u8BED\u8A00"
  },
  commands: {
    openChat: "\u6253\u5F00\u804A\u5929",
    exportNote: "\u5BFC\u51FA\u5F53\u524D\u7B14\u8BB0\u4E3A\u63D0\u793A\u8BCD",
    chatWithNote: "\u4E0E\u5F53\u524D\u7B14\u8BB0\u804A\u5929"
  },
  ui: {
    exportTitle: "\u5BFC\u51FA\u4E3A\u63D0\u793A\u8BCD",
    cancel: "\u53D6\u6D88",
    copiedToClipboard: "\u5DF2\u590D\u5236 {format} \u683C\u5F0F\u5230\u526A\u8D34\u677F",
    chatPlaceholder: "\u8F93\u5165\u95EE\u9898...",
    send: "\u53D1\u9001",
    sending: "...",
    chatViewTitle: "Goliath \u804A\u5929",
    noActiveNote: "\u6CA1\u6709\u6D3B\u52A8\u7B14\u8BB0",
    providerNotConfigured: "{provider} \u672A\u914D\u7F6E\u6216\u672A\u542F\u7528",
    exportFormatNames: {
      "claude-code": "Claude Code",
      "kimi-code": "Kimi Code CLI",
      "kimi-stream-json": "Kimi Stream JSON",
      "oai-chat": "OpenAI Chat Completions",
      "oai-response": "OpenAI Response API"
    },
    providerNames: {
      anthropic: "Anthropic",
      gemini: "Google Gemini",
      kimi: "Kimi\uFF08\u6708\u4E4B\u6697\u9762\uFF09",
      local: "\u672C\u5730 API\uFF08OpenAI \u517C\u5BB9\uFF09"
    },
    kimiLoginSuccess: "Kimi \u767B\u5F55\u6210\u529F\uFF01",
    kimiLoginFailed: "Kimi \u767B\u5F55\u5931\u8D25\u3002",
    kimiLogoutSuccess: "\u5DF2\u9000\u51FA Kimi \u767B\u5F55\u3002"
  },
  errors: {
    apiError: "API \u9519\u8BEF {status}\uFF1A{message}",
    responseNotReadable: "\u54CD\u5E94\u4F53\u4E0D\u53EF\u8BFB"
  }
};

// src/i18n/index.ts
var translations = { en, zh };
var currentLanguage = "en";
function setLanguage(lang) {
  currentLanguage = lang;
}
function t() {
  return translations[currentLanguage];
}
function formatTemplate(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_match, key) => vars[key] ?? key);
}

// src/auth/kimi-oauth.ts
var import_crypto = require("crypto");
var KIMI_CLIENT_ID = "17e5f671-d194-4dfb-9706-5516cb48c098";
var DEFAULT_OAUTH_HOST = "https://auth.kimi.com";
var ALLOWED_HOSTS = ["auth.kimi.com", "api.kimi.com"];
var ALGORITHM = "aes-256-gcm";
var KEY_LENGTH = 32;
var IV_LENGTH = 16;
var KimiOAuthError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "KimiOAuthError";
  }
};
var KimiOAuthUnauthorized = class extends KimiOAuthError {
  constructor(message) {
    super(message);
    this.name = "KimiOAuthUnauthorized";
  }
};
var KimiOAuthDeviceExpired = class extends KimiOAuthError {
  constructor(message) {
    super(message);
    this.name = "KimiOAuthDeviceExpired";
  }
};
function getOAuthHost() {
  return DEFAULT_OAUTH_HOST;
}
function validateUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new KimiOAuthError("Invalid URL format");
  }
  if (parsed.protocol !== "https:") {
    throw new KimiOAuthError("URL must use HTTPS protocol");
  }
  if (!ALLOWED_HOSTS.includes(parsed.host)) {
    throw new KimiOAuthError("URL host is not in the allowed list");
  }
}
function getCommonHeaders(deviceId) {
  return {
    "Content-Type": "application/x-www-form-urlencoded",
    "X-Msh-Platform": "obsidian_goliath",
    "X-Msh-Device-Id": deviceId
  };
}
function sanitizeErrorMessage(message) {
  return message.replace(/access_token=[^&\s]*/gi, "access_token=<redacted>").replace(/refresh_token=[^&\s]*/gi, "refresh_token=<redacted>");
}
function tokensFromResponse(payload) {
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: Date.now() / 1e3 + payload.expires_in,
    scope: payload.scope,
    tokenType: payload.token_type
  };
}
function tokensToJson(tokens) {
  return JSON.stringify({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: tokens.expiresAt,
    scope: tokens.scope,
    tokenType: tokens.tokenType
  });
}
function tokensFromJson(text) {
  const parsed = JSON.parse(text);
  return {
    accessToken: String(parsed.accessToken ?? ""),
    refreshToken: String(parsed.refreshToken ?? ""),
    expiresAt: Number(parsed.expiresAt ?? 0),
    scope: String(parsed.scope ?? ""),
    tokenType: String(parsed.tokenType ?? "")
  };
}
function generateEncryptionKey() {
  return (0, import_crypto.randomBytes)(KEY_LENGTH);
}
function encryptTokens(tokens, key) {
  const iv = (0, import_crypto.randomBytes)(IV_LENGTH);
  const cipher = (0, import_crypto.createCipheriv)(ALGORITHM, key, iv);
  const plaintext = tokensToJson(tokens);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64")
  };
}
function decryptTokens(store, key) {
  const decipher = (0, import_crypto.createDecipheriv)(
    ALGORITHM,
    key,
    Buffer.from(store.iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(store.tag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(store.ciphertext, "base64")),
    decipher.final()
  ]);
  return tokensFromJson(decrypted.toString("utf8"));
}
var STORAGE_KEY = "kimi_oauth_tokens";
var ENCRYPTION_KEY_KEY = "kimi_oauth_key";
async function loadStorageData(storage) {
  const data = await storage.loadData();
  if (!data) {
    return { key: null, tokenStore: null };
  }
  const keyBase64 = data[ENCRYPTION_KEY_KEY];
  let key = null;
  if (typeof keyBase64 === "string") {
    try {
      key = Buffer.from(keyBase64, "base64");
      if (key.length !== KEY_LENGTH) {
        key = null;
      }
    } catch {
      key = null;
    }
  }
  const tokenStore = data[STORAGE_KEY];
  return { key, tokenStore: tokenStore ?? null };
}
async function saveStorageData(storage, key, tokenStore) {
  const data = await storage.loadData();
  await storage.saveData({
    ...data,
    [ENCRYPTION_KEY_KEY]: key.toString("base64"),
    [STORAGE_KEY]: tokenStore
  });
}
async function saveTokens(tokens, storage) {
  let { key } = await loadStorageData(storage);
  if (!key) {
    key = generateEncryptionKey();
  }
  const encrypted = encryptTokens(tokens, key);
  await saveStorageData(storage, key, {
    key: STORAGE_KEY,
    encrypted
  });
}
async function loadTokens(storage) {
  const { key, tokenStore } = await loadStorageData(storage);
  if (!key || !tokenStore) {
    return null;
  }
  try {
    return decryptTokens(tokenStore.encrypted, key);
  } catch {
    return null;
  }
}
async function deleteTokens(storage) {
  const data = await storage.loadData();
  if (data) {
    delete data[STORAGE_KEY];
    delete data[ENCRYPTION_KEY_KEY];
    await storage.saveData(data);
  }
}
async function requestDeviceAuthorization(deviceId) {
  const host = getOAuthHost();
  const url = `${host}/api/oauth/device_authorization`;
  validateUrl(url);
  const body = new URLSearchParams({ client_id: KIMI_CLIENT_ID });
  const response = await fetch(url, {
    method: "POST",
    headers: getCommonHeaders(deviceId),
    body: body.toString()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new KimiOAuthError(
      sanitizeErrorMessage(
        `Device authorization failed: ${response.status} ${JSON.stringify(data)}`
      )
    );
  }
  return {
    userCode: String(data.user_code),
    deviceCode: String(data.device_code),
    verificationUri: String(data.verification_uri ?? ""),
    verificationUriComplete: String(data.verification_uri_complete ?? ""),
    expiresIn: typeof data.expires_in === "number" ? data.expires_in : null,
    interval: typeof data.interval === "number" ? data.interval : 5
  };
}
async function requestDeviceToken(auth, deviceId) {
  const host = getOAuthHost();
  const url = `${host}/api/oauth/token`;
  validateUrl(url);
  const body = new URLSearchParams({
    client_id: KIMI_CLIENT_ID,
    device_code: auth.deviceCode,
    grant_type: "urn:ietf:params:oauth:grant-type:device_code"
  });
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: getCommonHeaders(deviceId),
      body: body.toString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new KimiOAuthError(
      sanitizeErrorMessage(`Token polling request failed: ${message}`)
    );
  }
  const data = await response.json();
  if (response.status >= 500) {
    throw new KimiOAuthError(
      sanitizeErrorMessage(
        `Token polling server error: ${response.status}`
      )
    );
  }
  return { status: response.status, data };
}
async function refreshAccessToken(refreshTokenValue, deviceId) {
  const host = getOAuthHost();
  const url = `${host}/api/oauth/token`;
  validateUrl(url);
  const body = new URLSearchParams({
    client_id: KIMI_CLIENT_ID,
    grant_type: "refresh_token",
    refresh_token: refreshTokenValue
  });
  const response = await fetch(url, {
    method: "POST",
    headers: getCommonHeaders(deviceId),
    body: body.toString()
  });
  const data = await response.json();
  if (response.status === 401 || response.status === 403) {
    throw new KimiOAuthUnauthorized(
      sanitizeErrorMessage(
        String(data.error_description ?? "Token refresh unauthorized.")
      )
    );
  }
  if (!response.ok) {
    throw new KimiOAuthError(
      sanitizeErrorMessage(
        String(data.error_description ?? "Token refresh failed.")
      )
    );
  }
  return tokensFromResponse(data);
}
async function* loginKimiCode(deviceId, options = {}) {
  const { openBrowser, sleepMs = (ms) => new Promise((r) => setTimeout(r, ms)) } = options;
  while (true) {
    let auth;
    try {
      auth = await requestDeviceAuthorization(deviceId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      yield { type: "error", message: `Login failed: ${message}` };
      throw error;
    }
    yield {
      type: "info",
      message: "Please visit the following URL to finish authorization."
    };
    yield {
      type: "verification_url",
      message: `Verification URL: ${auth.verificationUriComplete}`,
      data: {
        verification_url: auth.verificationUriComplete,
        user_code: auth.userCode
      }
    };
    if (openBrowser) {
      try {
        openBrowser(auth.verificationUriComplete);
      } catch {
      }
    }
    const interval = Math.max(auth.interval, 1);
    let printedWait = false;
    try {
      while (true) {
        const { status, data } = await requestDeviceToken(auth, deviceId);
        if (status === 200 && data.access_token) {
          const tokens = tokensFromResponse(data);
          yield { type: "success", message: "Logged in successfully." };
          return tokens;
        }
        const errorCode = String(data.error ?? "unknown_error");
        if (errorCode === "expired_token") {
          throw new KimiOAuthDeviceExpired("Device code expired.");
        }
        const errorDescription = String(data.error_description ?? "");
        if (!printedWait) {
          yield {
            type: "waiting",
            message: `Waiting for user authorization...: ${errorDescription.trim()}`,
            data: { error: errorCode, error_description: errorDescription }
          };
          printedWait = true;
        }
        await sleepMs(interval * 1e3);
      }
    } catch (error) {
      if (error instanceof KimiOAuthDeviceExpired) {
        yield { type: "info", message: "Device code expired, restarting login..." };
        continue;
      }
      const message = error instanceof Error ? error.message : String(error);
      yield { type: "error", message: `Login failed: ${message}` };
      throw error;
    }
  }
}
async function ensureFreshTokens(storage, deviceId, thresholdSeconds = 300) {
  const tokens = await loadTokens(storage);
  if (!tokens) {
    return null;
  }
  const now = Date.now() / 1e3;
  if (tokens.expiresAt > now && tokens.expiresAt - now >= thresholdSeconds) {
    return tokens;
  }
  if (!tokens.refreshToken) {
    return null;
  }
  try {
    const refreshed = await refreshAccessToken(tokens.refreshToken, deviceId);
    await saveTokens(refreshed, storage);
    return refreshed;
  } catch (error) {
    if (error instanceof KimiOAuthUnauthorized) {
      await deleteTokens(storage);
      return null;
    }
    throw error;
  }
}

// src/ui/kimi-login-modal.ts
var import_obsidian = require("obsidian");
var KimiLoginModal = class extends import_obsidian.Modal {
  deviceId;
  onSuccess;
  abortController = new AbortController();
  statusEl;
  userCodeEl;
  linkEl = null;
  constructor(app, deviceId, onSuccess) {
    super(app);
    this.deviceId = deviceId;
    this.onSuccess = onSuccess;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("goliath-kimi-login-modal");
    contentEl.createEl("h2", { text: "Kimi Login" });
    const codeContainer = contentEl.createDiv({
      cls: "kimi-user-code-container"
    });
    codeContainer.style.marginBottom = "16px";
    codeContainer.createEl("p", {
      text: "Verification code:",
      cls: "kimi-code-label"
    });
    this.userCodeEl = codeContainer.createEl("code", {
      text: "Loading...",
      cls: "kimi-user-code"
    });
    this.userCodeEl.style.fontSize = "1.5em";
    this.userCodeEl.style.padding = "8px 16px";
    this.userCodeEl.style.backgroundColor = "var(--background-primary-alt)";
    this.userCodeEl.style.borderRadius = "6px";
    this.userCodeEl.style.display = "inline-block";
    this.userCodeEl.style.fontFamily = "monospace";
    this.statusEl = contentEl.createEl("p", {
      text: "Requesting device code...",
      cls: "kimi-login-status"
    });
    this.statusEl.style.marginTop = "12px";
    this.statusEl.style.color = "var(--text-muted)";
    const buttonContainer = contentEl.createDiv();
    buttonContainer.style.marginTop = "16px";
    const cancelButton = buttonContainer.createEl("button", {
      text: t().ui.cancel
    });
    cancelButton.addEventListener("click", () => this.close());
    this.startLoginFlow().catch(() => {
    });
  }
  onClose() {
    this.abortController.abort();
    const { contentEl } = this;
    contentEl.empty();
  }
  async startLoginFlow() {
    const generator = loginKimiCode(this.deviceId, {
      openBrowser: (url) => {
        if (import_obsidian.Platform.isDesktop) {
          try {
            window.open(url, "_blank");
          } catch {
          }
        }
      }
    });
    try {
      let eventValue;
      while (true) {
        if (this.abortController.signal.aborted) {
          await generator.return(void 0);
          break;
        }
        const result = await generator.next();
        if (result.done) {
          const tokens = result.value;
          await this.handleSuccess(tokens);
          break;
        }
        eventValue = result.value;
        this.handleEvent(eventValue);
      }
    } catch (error) {
      if (!this.abortController.signal.aborted) {
        const message = error instanceof Error ? error.message : String(error);
        this.statusEl.setText(`Login failed: ${message}`);
        this.statusEl.style.color = "var(--text-error)";
        new import_obsidian.Notice(`Kimi login failed: ${message}`);
      }
    }
  }
  handleEvent(event) {
    switch (event.type) {
      case "verification_url": {
        const userCode = String(event.data?.user_code ?? "");
        const verificationUrl = String(event.data?.verification_url ?? "");
        if (userCode) {
          this.userCodeEl.setText(userCode);
        }
        if (verificationUrl) {
          this.statusEl.empty();
          this.statusEl.appendText("Open this URL to authorize: ");
          this.linkEl = this.statusEl.createEl("a", {
            text: verificationUrl,
            href: verificationUrl
          });
          this.linkEl.target = "_blank";
          this.statusEl.style.color = "var(--text-accent)";
        }
        break;
      }
      case "waiting": {
        if (!this.linkEl) {
          this.statusEl.setText(event.message);
        }
        break;
      }
      case "success": {
        this.statusEl.setText("Login successful!");
        this.statusEl.style.color = "var(--text-success)";
        break;
      }
      case "error": {
        this.statusEl.setText(event.message);
        this.statusEl.style.color = "var(--text-error)";
        break;
      }
      case "info":
      default: {
        if (!this.linkEl) {
          this.statusEl.setText(event.message);
        }
      }
    }
  }
  async handleSuccess(tokens) {
    new import_obsidian.Notice("Kimi login successful!");
    if (this.onSuccess) {
      this.onSuccess(tokens);
    }
    this.close();
  }
};

// src/settings-tab.ts
var GoliathSettingTab = class extends import_obsidian2.PluginSettingTab {
  plugin;
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    const i18n = t();
    containerEl.createEl("h2", { text: i18n.settings.title });
    this.addLanguageSetting();
    this.addDefaultProviderSetting();
    this.addDefaultFormatSetting();
    this.addSystemPromptSetting();
    this.addContextSettings();
    containerEl.createEl("h3", { text: i18n.settings.apiProviders });
    this.addProviderSetting("anthropic");
    this.addProviderSetting("gemini");
    this.addProviderSetting("kimi");
    this.addProviderSetting("local");
  }
  addLanguageSetting() {
    const i18n = t();
    new import_obsidian2.Setting(this.containerEl).setName(i18n.settings.language).setDesc(i18n.settings.languageDesc).addDropdown(
      (dropdown) => dropdown.addOption("en", "English").addOption("zh", "\u4E2D\u6587").setValue(this.plugin.settings.language).onChange(async (value) => {
        this.plugin.settings.language = value;
        await this.plugin.saveSettings();
        this.display();
      })
    );
  }
  addDefaultProviderSetting() {
    const i18n = t();
    new import_obsidian2.Setting(this.containerEl).setName(i18n.settings.defaultProvider).setDesc(i18n.settings.defaultProviderDesc).addDropdown(
      (dropdown) => dropdown.addOptions(i18n.ui.providerNames).setValue(this.plugin.settings.defaultProvider).onChange(async (value) => {
        this.plugin.settings.defaultProvider = value;
        await this.plugin.saveSettings();
      })
    );
  }
  addDefaultFormatSetting() {
    const i18n = t();
    new import_obsidian2.Setting(this.containerEl).setName(i18n.settings.defaultFormat).setDesc(i18n.settings.defaultFormatDesc).addDropdown(
      (dropdown) => dropdown.addOptions(i18n.ui.exportFormatNames).setValue(this.plugin.settings.defaultFormat).onChange(async (value) => {
        this.plugin.settings.defaultFormat = value;
        await this.plugin.saveSettings();
      })
    );
  }
  addSystemPromptSetting() {
    const i18n = t();
    new import_obsidian2.Setting(this.containerEl).setName(i18n.settings.systemPrompt).setDesc(i18n.settings.systemPromptDesc).addTextArea(
      (text) => text.setValue(this.plugin.settings.systemPrompt).onChange(async (value) => {
        this.plugin.settings.systemPrompt = value;
        await this.plugin.saveSettings();
      })
    );
  }
  addContextSettings() {
    const i18n = t();
    new import_obsidian2.Setting(this.containerEl).setName(i18n.settings.includeFrontmatter).setDesc(i18n.settings.includeFrontmatterDesc).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.includeFrontmatter).onChange(async (value) => {
        this.plugin.settings.includeFrontmatter = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(this.containerEl).setName(i18n.settings.includeLinkedNotes).setDesc(i18n.settings.includeLinkedNotesDesc).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.includeLinkedNotes).onChange(async (value) => {
        this.plugin.settings.includeLinkedNotes = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(this.containerEl).setName(i18n.settings.maxLinkedDepth).setDesc(i18n.settings.maxLinkedDepthDesc).addSlider(
      (slider) => slider.setLimits(1, 3, 1).setValue(this.plugin.settings.maxLinkedDepth).setDynamicTooltip().onChange(async (value) => {
        this.plugin.settings.maxLinkedDepth = value;
        await this.plugin.saveSettings();
      })
    );
  }
  addProviderSetting(provider) {
    const config = this.plugin.settings[provider];
    const i18n = t();
    const container = this.containerEl.createDiv();
    container.createEl("h4", { text: i18n.ui.providerNames[provider] });
    new import_obsidian2.Setting(container).setName(i18n.settings.enabled).addToggle(
      (toggle) => toggle.setValue(config.enabled).onChange(async (value) => {
        config.enabled = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(container).setName(i18n.settings.apiKey).setDesc(i18n.settings.apiKeyDesc).addText(
      (text) => text.setPlaceholder(i18n.settings.apiKey).setValue(config.apiKey).onChange(async (value) => {
        config.apiKey = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(container).setName(i18n.settings.baseUrl).setDesc(i18n.settings.baseUrlDesc).addText(
      (text) => text.setPlaceholder("https://api.example.com").setValue(config.baseUrl).onChange(async (value) => {
        config.baseUrl = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(container).setName(i18n.settings.model).setDesc(i18n.settings.modelDesc).addText(
      (text) => text.setPlaceholder("model-name").setValue(config.model).onChange(async (value) => {
        config.model = value;
        await this.plugin.saveSettings();
      })
    );
    if (provider === "kimi") {
      this.addKimiOAuthControls(container);
    }
  }
  addKimiOAuthControls(container) {
    const oauthContainer = container.createDiv();
    oauthContainer.style.marginTop = "12px";
    oauthContainer.createEl("h5", { text: "OAuth" });
    const storage = {
      loadData: () => this.plugin.loadData(),
      saveData: (data) => this.plugin.saveData(data)
    };
    loadTokens(storage).then((tokens) => {
      oauthContainer.empty();
      oauthContainer.createEl("h5", { text: "OAuth" });
      if (tokens) {
        const statusEl = oauthContainer.createEl("p", {
          text: `Logged in (expires: ${new Date(tokens.expiresAt * 1e3).toLocaleString()})`
        });
        statusEl.style.color = "var(--text-success)";
        const logoutButton = oauthContainer.createEl("button", {
          text: "Logout from Kimi"
        });
        logoutButton.addEventListener("click", async () => {
          await deleteTokens(storage);
          new import_obsidian2.Notice("Logged out from Kimi");
          this.display();
        });
      } else {
        const statusEl = oauthContainer.createEl("p", {
          text: "Not logged in. Use the button below to authenticate."
        });
        statusEl.style.color = "var(--text-muted)";
        const loginButton = oauthContainer.createEl("button", {
          text: "Login with Kimi",
          cls: "mod-cta"
        });
        loginButton.addEventListener("click", async () => {
          const data = await this.plugin.loadData();
          let deviceId = data?.kimiDeviceId;
          if (typeof deviceId !== "string" || !deviceId) {
            deviceId = crypto.randomUUID();
            await this.plugin.saveData({ ...data, kimiDeviceId: deviceId });
          }
          new KimiLoginModal(this.app, deviceId, async (tokens2) => {
            await saveTokens(tokens2, storage);
            const i18n = t();
            new import_obsidian2.Notice(i18n.ui.kimiLoginSuccess ?? "Kimi login successful!");
            this.display();
          }).open();
        });
      }
    });
  }
};

// src/ui/chat-view.ts
var import_obsidian4 = require("obsidian");

// src/core/chat-core.ts
var ChatCore = class {
  apiClient;
  toolRegistry;
  toolExtras;
  maxToolIterations;
  constructor(options) {
    this.apiClient = options.apiClient;
    this.toolRegistry = options.toolRegistry;
    this.toolExtras = { app: options.app };
    this.maxToolIterations = options.maxToolIterations ?? 5;
  }
  async sendMessage(messages, onStreamChunk) {
    const toolDefinitions = this.toolRegistry.getDefinitions();
    const request = {
      messages,
      temperature: 0.7,
      maxTokens: 4096,
      tools: toolDefinitions.length > 0 ? toolDefinitions : void 0
    };
    const allToolResults = [];
    let toolCallCount = 0;
    while (true) {
      let response;
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
          toolResults: allToolResults.length > 0 ? allToolResults : void 0
        };
      }
      if (toolCallCount >= this.maxToolIterations) {
        return {
          content: "Reached maximum tool iterations. Here are the results:\n\n" + allToolResults.map((r) => `${r.name}: ${r.content}`).join("\n\n"),
          toolResults: allToolResults
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
          toolCalls: response.toolCalls
        },
        ...toolResults.map((result) => ({
          role: "tool",
          content: result.content,
          toolCallId: result.toolCallId
        }))
      ];
      delete request.tools;
    }
  }
  async executeToolCalls(toolCalls) {
    const results = [];
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
};

// src/core/tools/registry.ts
var ToolRegistry = class {
  tools = /* @__PURE__ */ new Map();
  register(definition, implementation) {
    this.tools.set(definition.name, { definition, implementation });
  }
  getDefinitions() {
    return Array.from(this.tools.values()).map((t2) => t2.definition);
  }
  has(name) {
    return this.tools.has(name);
  }
  async execute(name, args, extras, toolCallId) {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        toolCallId,
        name,
        content: `Tool "${name}" not found`,
        isError: true
      };
    }
    try {
      const content = await tool.implementation(args, extras);
      return { toolCallId, name, content };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Goliath] Tool "${name}" execution error:`, message);
      return { toolCallId, name, content: message, isError: true };
    }
  }
};

// src/core/tools/obsidian-tools.ts
var import_obsidian3 = require("obsidian");
function getStringArg(args, key) {
  const value = args[key];
  if (typeof value !== "string") {
    throw new Error(`Argument "${key}" must be a string`);
  }
  return value;
}
function getOptionalStringArg(args, key) {
  const value = args[key];
  if (value === void 0 || value === null)
    return void 0;
  if (typeof value !== "string") {
    throw new Error(`Argument "${key}" must be a string`);
  }
  return value;
}
var readNoteDefinition = {
  name: "read_note",
  description: "Read the full content of an Obsidian note by its path. Use this when you need to see the content of a specific note.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "The path to the note (e.g. 'Folder/Note.md')"
      }
    },
    required: ["path"]
  }
};
var readNoteImpl = async (args, extras) => {
  const path = getStringArg(args, "path");
  const file = extras.app.vault.getAbstractFileByPath(path);
  if (!file) {
    throw new Error(`Note "${path}" not found`);
  }
  if (!(file instanceof import_obsidian3.TFile)) {
    throw new Error(`"${path}" is not a file`);
  }
  const content = await extras.app.vault.cachedRead(file);
  return content;
};
var searchVaultDefinition = {
  name: "search_vault",
  description: "Search the Obsidian vault for notes matching a query. Returns matching note paths and snippets of content.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query string"
      }
    },
    required: ["query"]
  }
};
var searchVaultImpl = async (args, extras) => {
  const query = getStringArg(args, "query").toLowerCase();
  const files = extras.app.vault.getMarkdownFiles();
  const results = [];
  for (const file of files) {
    const content = await extras.app.vault.cachedRead(file);
    if (file.path.toLowerCase().includes(query) || content.toLowerCase().includes(query)) {
      const lines = content.split("\n");
      const matchingLines = lines.map((line, index) => ({ line, index: index + 1 })).filter(({ line }) => line.toLowerCase().includes(query)).slice(0, 3);
      const snippets = matchingLines.map(({ line, index }) => `  L${index}: ${line.trim()}`).join("\n");
      results.push(`File: ${file.path}
${snippets}`);
    }
  }
  if (results.length === 0) {
    return `No notes found matching "${query}"`;
  }
  return results.slice(0, 10).join("\n\n");
};
var createNoteDefinition = {
  name: "create_note",
  description: "Create a new Obsidian note at the specified path with the given content.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "The path for the new note (e.g. 'Folder/New Note.md')"
      },
      content: {
        type: "string",
        description: "The content to write to the new note"
      }
    },
    required: ["path", "content"]
  }
};
var createNoteImpl = async (args, extras) => {
  const path = getStringArg(args, "path");
  const content = getStringArg(args, "content");
  const existing = extras.app.vault.getAbstractFileByPath(path);
  if (existing) {
    throw new Error(`A file already exists at "${path}"`);
  }
  await extras.app.vault.create(path, content);
  return `Created note at "${path}"`;
};
var editNoteDefinition = {
  name: "edit_note",
  description: "Edit an existing Obsidian note. Supports appending content or replacing the entire note.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "The path to the note to edit"
      },
      operation: {
        type: "string",
        description: "Either 'append' or 'replace'"
      },
      content: {
        type: "string",
        description: "The new content to append or replace with"
      }
    },
    required: ["path", "operation", "content"]
  }
};
var editNoteImpl = async (args, extras) => {
  const path = getStringArg(args, "path");
  const operation = getStringArg(args, "operation");
  const content = getStringArg(args, "content");
  const file = extras.app.vault.getAbstractFileByPath(path);
  if (!file || !(file instanceof import_obsidian3.TFile)) {
    throw new Error(`Note "${path}" not found`);
  }
  if (operation === "append") {
    const existing = await extras.app.vault.cachedRead(file);
    await extras.app.vault.modify(file, existing + "\n" + content);
    return `Appended content to "${path}"`;
  } else if (operation === "replace") {
    await extras.app.vault.modify(file, content);
    return `Replaced content of "${path}"`;
  } else {
    throw new Error(`Unknown operation "${operation}". Use "append" or "replace".`);
  }
};
var listNotesDefinition = {
  name: "list_notes",
  description: "List all notes in the Obsidian vault, optionally filtered by a folder path.",
  parameters: {
    type: "object",
    properties: {
      folder: {
        type: "string",
        description: "Optional folder path to filter by (e.g. 'Projects/'). If omitted, lists all notes."
      }
    },
    required: []
  }
};
var listNotesImpl = async (args, extras) => {
  const folder = getOptionalStringArg(args, "folder");
  const files = extras.app.vault.getMarkdownFiles();
  const filtered = folder ? files.filter((f) => f.path.startsWith(folder)) : files;
  if (filtered.length === 0) {
    return folder ? `No notes found in folder "${folder}"` : "No notes found in vault";
  }
  return filtered.map((f) => f.path).join("\n");
};
var listTagsDefinition = {
  name: "list_tags",
  description: "List all tags used across the Obsidian vault.",
  parameters: {
    type: "object",
    properties: {},
    required: []
  }
};
var listTagsImpl = async (_args, extras) => {
  const tags = /* @__PURE__ */ new Set();
  const files = extras.app.vault.getMarkdownFiles();
  for (const file of files) {
    const cache = extras.app.metadataCache.getFileCache(file);
    if (cache?.tags) {
      for (const tag of cache.tags) {
        tags.add(tag.tag);
      }
    }
    if (cache?.frontmatter?.tags) {
      const frontmatterTags = cache.frontmatter.tags;
      if (Array.isArray(frontmatterTags)) {
        for (const tag of frontmatterTags) {
          if (typeof tag === "string") {
            tags.add(tag.startsWith("#") ? tag : `#${tag}`);
          }
        }
      }
    }
  }
  if (tags.size === 0) {
    return "No tags found in vault";
  }
  return Array.from(tags).sort().join("\n");
};

// src/core/tools/index.ts
function createDefaultToolRegistry() {
  const registry = new ToolRegistry();
  registry.register(readNoteDefinition, readNoteImpl);
  registry.register(searchVaultDefinition, searchVaultImpl);
  registry.register(createNoteDefinition, createNoteImpl);
  registry.register(editNoteDefinition, editNoteImpl);
  registry.register(listNotesDefinition, listNotesImpl);
  registry.register(listTagsDefinition, listTagsImpl);
  return registry;
}

// src/ui/chat-view.ts
var VIEW_TYPE_GOLIATH_CHAT = "goliath-chat-view";
var ChatView = class extends import_obsidian4.ItemView {
  messages = [];
  apiClient = null;
  chatCore = null;
  appRef = null;
  messageContainer = null;
  inputElement = null;
  sendButton = null;
  modelLabelEl = null;
  currentProviderName = "";
  currentModel = "";
  onSwitchModel;
  isStreaming = false;
  streamStyleInjected = false;
  constructor(leaf) {
    super(leaf);
  }
  getViewType() {
    return VIEW_TYPE_GOLIATH_CHAT;
  }
  getDisplayText() {
    return t().ui.chatViewTitle;
  }
  getIcon() {
    return "message-circle";
  }
  setApp(app) {
    this.appRef = app;
  }
  setApiClient(client) {
    this.apiClient = client;
    if (this.appRef) {
      this.chatCore = new ChatCore({
        apiClient: client,
        toolRegistry: createDefaultToolRegistry(),
        app: this.appRef
      });
    }
  }
  setSystemPrompt(prompt) {
    const existingIndex = this.messages.findIndex((m) => m.role === "system");
    if (prompt) {
      const systemMessage = {
        role: "system",
        content: prompt,
        id: this.generateId()
      };
      if (existingIndex >= 0) {
        this.messages[existingIndex] = systemMessage;
      } else {
        this.messages.unshift(systemMessage);
      }
    } else if (existingIndex >= 0) {
      this.messages.splice(existingIndex, 1);
    }
  }
  setModelInfo(providerName, model, onSwitch) {
    this.currentProviderName = providerName;
    this.currentModel = model;
    this.onSwitchModel = onSwitch;
    this.updateModelLabel();
  }
  updateModelLabel() {
    if (!this.modelLabelEl)
      return;
    const label = this.currentModel ? `${this.currentProviderName} \xB7 ${this.currentModel}` : this.currentProviderName;
    this.modelLabelEl.innerHTML = `${label} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
  }
  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("goliath-chat-view");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.height = "100%";
    const i18n = t();
    this.messageContainer = container.createDiv({
      cls: "goliath-chat-messages"
    });
    this.messageContainer.style.flex = "1";
    this.messageContainer.style.overflowY = "auto";
    this.messageContainer.style.padding = "12px";
    this.messageContainer.style.display = "flex";
    this.messageContainer.style.flexDirection = "column";
    this.messageContainer.style.gap = "12px";
    const inputWrapper = container.createDiv({
      cls: "goliath-chat-input-wrapper"
    });
    inputWrapper.style.margin = "0 12px 12px 12px";
    inputWrapper.style.padding = "12px 16px";
    inputWrapper.style.border = "1px solid var(--background-modifier-border)";
    inputWrapper.style.borderRadius = "16px";
    inputWrapper.style.backgroundColor = "var(--background-primary)";
    inputWrapper.style.display = "flex";
    inputWrapper.style.flexDirection = "column";
    inputWrapper.style.gap = "8px";
    this.inputElement = inputWrapper.createEl("textarea", {
      cls: "goliath-chat-input"
    });
    this.inputElement.style.width = "100%";
    this.inputElement.style.border = "none";
    this.inputElement.style.outline = "none";
    this.inputElement.style.background = "transparent";
    this.inputElement.style.resize = "none";
    this.inputElement.style.minHeight = "24px";
    this.inputElement.style.maxHeight = "200px";
    this.inputElement.style.height = "24px";
    this.inputElement.style.overflowY = "auto";
    this.inputElement.style.fontSize = "14px";
    this.inputElement.style.lineHeight = "1.5";
    this.inputElement.style.color = "var(--text-normal)";
    this.inputElement.placeholder = i18n.ui.chatPlaceholder;
    this.inputElement.addEventListener("input", () => {
      this.adjustInputHeight();
      this.updateSendButtonState();
    });
    this.inputElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    this.inputElement.addEventListener("focus", () => {
      inputWrapper.style.borderColor = "var(--interactive-accent)";
    });
    this.inputElement.addEventListener("blur", () => {
      inputWrapper.style.borderColor = "var(--background-modifier-border)";
    });
    const inputFooter = inputWrapper.createDiv({
      cls: "goliath-chat-input-footer"
    });
    inputFooter.style.display = "flex";
    inputFooter.style.alignItems = "center";
    inputFooter.style.justifyContent = "space-between";
    const addBtn = inputFooter.createEl("button", {
      cls: "goliath-chat-add-btn"
    });
    addBtn.style.width = "28px";
    addBtn.style.height = "28px";
    addBtn.style.borderRadius = "50%";
    addBtn.style.border = "1px solid var(--background-modifier-border)";
    addBtn.style.background = "transparent";
    addBtn.style.color = "var(--text-muted)";
    addBtn.style.cursor = "pointer";
    addBtn.style.display = "flex";
    addBtn.style.alignItems = "center";
    addBtn.style.justifyContent = "center";
    addBtn.style.padding = "0";
    addBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
    addBtn.title = "Add context";
    const rightSection = inputFooter.createDiv({
      cls: "goliath-chat-input-right"
    });
    rightSection.style.display = "flex";
    rightSection.style.alignItems = "center";
    rightSection.style.gap = "8px";
    this.modelLabelEl = rightSection.createDiv({
      cls: "goliath-chat-model-label"
    });
    this.modelLabelEl.style.fontSize = "12px";
    this.modelLabelEl.style.color = "var(--text-muted)";
    this.modelLabelEl.style.cursor = "pointer";
    this.modelLabelEl.style.display = "flex";
    this.modelLabelEl.style.alignItems = "center";
    this.modelLabelEl.style.gap = "4px";
    this.modelLabelEl.addEventListener("click", () => {
      if (this.onSwitchModel) {
        this.onSwitchModel().catch((error) => {
          const message = error instanceof Error ? error.message : String(error);
          console.error("[Goliath] Switch model error:", message);
          new import_obsidian4.Notice(`Switch model error: ${message}`, 5e3);
        });
      }
    });
    this.sendButton = rightSection.createEl("button", {
      cls: "goliath-chat-send-btn"
    });
    this.sendButton.style.width = "32px";
    this.sendButton.style.height = "32px";
    this.sendButton.style.borderRadius = "50%";
    this.sendButton.style.border = "none";
    this.sendButton.style.backgroundColor = "var(--background-modifier-border-hover)";
    this.sendButton.style.color = "var(--text-on-accent)";
    this.sendButton.style.cursor = "pointer";
    this.sendButton.style.display = "flex";
    this.sendButton.style.alignItems = "center";
    this.sendButton.style.justifyContent = "center";
    this.sendButton.style.padding = "0";
    this.sendButton.style.transition = "background-color 0.2s";
    this.sendButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`;
    this.sendButton.disabled = true;
    this.sendButton.addEventListener("click", () => this.sendMessage());
    this.injectStreamStyles();
  }
  async onClose() {
  }
  generateId() {
    return Math.random().toString(36).substring(2, 9);
  }
  adjustInputHeight() {
    if (!this.inputElement)
      return;
    this.inputElement.style.height = "auto";
    const newHeight = Math.min(this.inputElement.scrollHeight, 200);
    this.inputElement.style.height = `${newHeight}px`;
  }
  async sendMessage() {
    if (!this.chatCore || !this.inputElement || this.isStreaming)
      return;
    const userContent = this.inputElement.value.trim();
    if (!userContent)
      return;
    this.inputElement.value = "";
    this.adjustInputHeight();
    const userMessage = {
      role: "user",
      content: userContent,
      id: this.generateId()
    };
    this.messages.push(userMessage);
    this.renderUserMessage(userMessage);
    this.isStreaming = true;
    this.updateSendButtonState();
    const assistantMessage = {
      role: "assistant",
      content: "",
      id: this.generateId()
    };
    this.messages.push(assistantMessage);
    const { messageEl, contentEl } = this.createAssistantMessageElement();
    const indicatorEl = messageEl.createDiv({
      cls: "goliath-streaming-indicator"
    });
    indicatorEl.innerHTML = "<span></span><span></span><span></span>";
    this.scrollToBottom();
    try {
      let fullContent = "";
      const result = await this.chatCore.sendMessage(
        this.messages,
        (chunk) => {
          fullContent += chunk;
          assistantMessage.content = fullContent;
          contentEl.textContent = fullContent;
          this.scrollToBottom();
        }
      );
      assistantMessage.content = result.content;
      contentEl.empty();
      await this.renderMarkdownContent(contentEl, result.content);
      indicatorEl.remove();
      if (result.toolResults && result.toolResults.length > 0) {
        this.renderToolResults(messageEl, result.toolResults);
      }
      this.addResponseActions(messageEl, assistantMessage);
      if (result.toolResults) {
        const toolMessages = result.toolResults.map((tr) => ({
          role: "tool",
          content: tr.content,
          toolCallId: tr.toolCallId
        }));
        this.messages.push(...toolMessages);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        indicatorEl.remove();
        return;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[Goliath] Chat error:", {
        error: errorMessage,
        messagesCount: this.messages.length,
        apiClient: this.apiClient?.constructor?.name ?? "null"
      });
      new import_obsidian4.Notice(`Goliath error: ${errorMessage}`, 5e3);
      assistantMessage.content = `Error: ${errorMessage}`;
      contentEl.empty();
      contentEl.textContent = assistantMessage.content;
      contentEl.addClass("goliath-chat-error");
      indicatorEl.remove();
    } finally {
      this.isStreaming = false;
      this.updateSendButtonState();
    }
  }
  renderUserMessage(message) {
    if (!this.messageContainer)
      return;
    const messageEl = this.messageContainer.createDiv({
      cls: "goliath-chat-message goliath-chat-message-user"
    });
    messageEl.style.alignSelf = "flex-end";
    messageEl.style.maxWidth = "90%";
    messageEl.style.padding = "8px 12px";
    messageEl.style.borderRadius = "8px";
    messageEl.style.backgroundColor = "var(--interactive-accent)";
    messageEl.style.color = "var(--text-on-accent)";
    const contentEl = messageEl.createDiv();
    contentEl.style.whiteSpace = "pre-wrap";
    contentEl.style.wordBreak = "break-word";
    contentEl.textContent = message.content;
  }
  createAssistantMessageElement() {
    if (!this.messageContainer) {
      const dummy = document.createElement("div");
      return { messageEl: dummy, contentEl: dummy };
    }
    const messageEl = this.messageContainer.createDiv({
      cls: "goliath-chat-message goliath-chat-message-assistant"
    });
    messageEl.style.alignSelf = "flex-start";
    messageEl.style.maxWidth = "90%";
    messageEl.style.padding = "8px 12px";
    messageEl.style.borderRadius = "8px";
    messageEl.style.backgroundColor = "var(--background-secondary)";
    messageEl.style.border = "1px solid var(--background-modifier-border)";
    const contentEl = messageEl.createDiv({
      cls: "goliath-chat-message-content"
    });
    return { messageEl, contentEl };
  }
  async renderMarkdownContent(el, markdown) {
    try {
      await import_obsidian4.MarkdownRenderer.renderMarkdown(
        markdown,
        el,
        "",
        this
      );
      this.enhanceCodeBlocks(el);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[Goliath] Markdown render error:", message);
      el.textContent = markdown;
    }
  }
  enhanceCodeBlocks(el) {
    const preElements = el.querySelectorAll("pre");
    preElements.forEach((pre) => {
      if (pre.querySelector(".goliath-code-copy-btn"))
        return;
      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      wrapper.style.display = "inline-block";
      wrapper.style.width = "100%";
      const copyBtn = document.createElement("button");
      copyBtn.className = "goliath-code-copy-btn";
      copyBtn.textContent = "Copy";
      copyBtn.style.position = "absolute";
      copyBtn.style.top = "4px";
      copyBtn.style.right = "4px";
      copyBtn.style.padding = "2px 8px";
      copyBtn.style.fontSize = "10px";
      copyBtn.style.borderRadius = "4px";
      copyBtn.style.backgroundColor = "var(--background-primary)";
      copyBtn.style.color = "var(--text-normal)";
      copyBtn.style.border = "1px solid var(--background-modifier-border)";
      copyBtn.style.cursor = "pointer";
      copyBtn.style.opacity = "0";
      copyBtn.style.transition = "opacity 0.2s";
      const codeEl = pre.querySelector("code");
      copyBtn.addEventListener("click", () => {
        if (codeEl) {
          navigator.clipboard.writeText(codeEl.textContent || "");
          copyBtn.textContent = "Copied!";
          setTimeout(() => {
            copyBtn.textContent = "Copy";
          }, 2e3);
        }
      });
      pre.addEventListener("mouseenter", () => {
        copyBtn.style.opacity = "1";
      });
      pre.addEventListener("mouseleave", () => {
        copyBtn.style.opacity = "0";
      });
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      wrapper.appendChild(copyBtn);
    });
  }
  renderToolResults(messageEl, toolResults) {
    const toolsEl = messageEl.createDiv({
      cls: "goliath-tool-results"
    });
    toolsEl.style.marginTop = "8px";
    toolsEl.style.display = "flex";
    toolsEl.style.flexDirection = "column";
    toolsEl.style.gap = "4px";
    for (const result of toolResults) {
      const itemEl = toolsEl.createDiv({
        cls: "goliath-tool-result"
      });
      itemEl.style.fontSize = "11px";
      itemEl.style.padding = "4px 8px";
      itemEl.style.borderRadius = "4px";
      itemEl.style.backgroundColor = "var(--background-modifier-form-field)";
      itemEl.style.color = result.isError ? "var(--text-error)" : "var(--text-muted)";
      itemEl.style.border = `1px solid ${result.isError ? "var(--background-modifier-error)" : "var(--background-modifier-border)"}`;
      const nameEl = itemEl.createDiv();
      nameEl.style.fontWeight = "bold";
      nameEl.textContent = result.isError ? `\u26A0 ${result.name}` : `\u2713 ${result.name}`;
      const preview = result.content.slice(0, 200);
      const contentEl = itemEl.createDiv();
      contentEl.style.marginTop = "2px";
      contentEl.style.whiteSpace = "pre-wrap";
      contentEl.style.wordBreak = "break-word";
      contentEl.textContent = preview + (result.content.length > 200 ? "..." : "");
    }
  }
  addResponseActions(messageEl, message) {
    const actionsEl = messageEl.createDiv({
      cls: "goliath-message-actions"
    });
    actionsEl.style.display = "flex";
    actionsEl.style.gap = "8px";
    actionsEl.style.marginTop = "8px";
    actionsEl.style.paddingTop = "8px";
    actionsEl.style.borderTop = "1px solid var(--background-modifier-border-hover)";
    actionsEl.style.opacity = "0";
    actionsEl.style.transition = "opacity 0.2s";
    const copyBtn = actionsEl.createEl("button", {
      text: "Copy",
      cls: "goliath-action-btn"
    });
    copyBtn.style.fontSize = "11px";
    copyBtn.style.padding = "2px 8px";
    copyBtn.style.background = "transparent";
    copyBtn.style.border = "1px solid var(--background-modifier-border)";
    copyBtn.style.borderRadius = "4px";
    copyBtn.style.color = "var(--text-muted)";
    copyBtn.style.cursor = "pointer";
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(message.content);
      copyBtn.textContent = "Copied!";
      setTimeout(() => {
        copyBtn.textContent = "Copy";
      }, 2e3);
    });
    const deleteBtn = actionsEl.createEl("button", {
      text: "Delete",
      cls: "goliath-action-btn"
    });
    deleteBtn.style.fontSize = "11px";
    deleteBtn.style.padding = "2px 8px";
    deleteBtn.style.background = "transparent";
    deleteBtn.style.border = "1px solid var(--background-modifier-border)";
    deleteBtn.style.borderRadius = "4px";
    deleteBtn.style.color = "var(--text-muted)";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.addEventListener("click", () => {
      const index = this.messages.findIndex((m) => m.id === message.id);
      if (index >= 0) {
        this.messages.splice(index, 1);
        messageEl.remove();
      }
    });
    messageEl.addEventListener("mouseenter", () => {
      actionsEl.style.opacity = "1";
    });
    messageEl.addEventListener("mouseleave", () => {
      actionsEl.style.opacity = "0";
    });
  }
  injectStreamStyles() {
    if (this.streamStyleInjected)
      return;
    this.streamStyleInjected = true;
    const style = document.createElement("style");
    style.textContent = `
      .goliath-streaming-indicator {
        display: flex;
        gap: 4px;
        padding: 8px 0 4px;
        align-items: center;
      }
      .goliath-streaming-indicator span {
        width: 6px;
        height: 6px;
        background-color: var(--text-muted);
        border-radius: 50%;
        display: inline-block;
        animation: goliath-pulse 1.4s infinite ease-in-out both;
      }
      .goliath-streaming-indicator span:nth-child(1) { animation-delay: -0.32s; }
      .goliath-streaming-indicator span:nth-child(2) { animation-delay: -0.16s; }
      @keyframes goliath-pulse {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }
  scrollToBottom() {
    if (this.messageContainer) {
      this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }
  }
  updateSendButtonState() {
    if (!this.sendButton || !this.inputElement)
      return;
    const canSend = this.inputElement.value.trim().length > 0 && !this.isStreaming;
    this.sendButton.disabled = !canSend;
    this.sendButton.style.backgroundColor = canSend ? "var(--interactive-accent)" : "var(--background-modifier-border-hover)";
  }
};

// src/ui/export-modal.ts
var import_obsidian5 = require("obsidian");

// src/formats/claude-code.ts
function generateClaudeCodeFormat(contexts, options) {
  const parts = [];
  if (options.systemPrompt) {
    parts.push(`<system>${options.systemPrompt}</system>`);
  }
  for (const context of contexts) {
    const ext = context.path.split(".").pop() ?? "";
    parts.push(
      `<file path="${context.path}">
\`\`\`${ext}
${context.content}
\`\`\`
</file>`
    );
  }
  if (options.userQuery) {
    parts.push(`<question>
${options.userQuery}
</question>`);
  }
  return {
    format: "claude-code",
    content: parts.join("\n\n")
  };
}

// src/formats/kimi-code.ts
function generateKimiCodeFormat(contexts, options) {
  const parts = [];
  if (options.systemPrompt) {
    parts.push(`# System
${options.systemPrompt}`);
  }
  for (const context of contexts) {
    parts.push(
      `---
## File: ${context.path}
\`\`\`
${context.content}
\`\`\``
    );
  }
  if (options.userQuery) {
    parts.push(`---
## Question
${options.userQuery}`);
  }
  return {
    format: "kimi-code",
    content: parts.join("\n\n")
  };
}

// src/formats/kimi-stream-json.ts
function generateKimiStreamJsonFormat(contexts, options) {
  const parts = [];
  if (options.systemPrompt) {
    parts.push(options.systemPrompt);
  }
  for (const context of contexts) {
    const ext = context.path.split(".").pop() ?? "";
    const lang = ext ? `${ext}
` : "\n";
    parts.push(
      `File: ${context.path}
\`\`\`${lang}${context.content}
\`\`\``
    );
  }
  if (options.userQuery) {
    parts.push(options.userQuery);
  }
  const message = {
    role: "user",
    content: parts.join("\n\n")
  };
  return {
    format: "kimi-stream-json",
    content: JSON.stringify(message)
  };
}

// src/formats/oai-chat.ts
function generateOaiChatFormat(contexts, options) {
  const messages = [];
  if (options.systemPrompt) {
    messages.push({
      role: "system",
      content: options.systemPrompt
    });
  }
  const contextContent = contexts.map((ctx) => `File: ${ctx.path}
\`\`\`
${ctx.content}
\`\`\``).join("\n\n");
  let userContent = contextContent;
  if (options.userQuery) {
    userContent += `

${options.userQuery}`;
  }
  messages.push({
    role: "user",
    content: userContent
  });
  return {
    format: "oai-chat",
    content: JSON.stringify({ messages }, null, 2),
    metadata: { messages }
  };
}

// src/formats/oai-response.ts
function generateOaiResponseFormat(contexts, options) {
  const input = [];
  if (options.systemPrompt) {
    input.push({
      type: "message",
      role: "system",
      content: options.systemPrompt
    });
  }
  for (const context of contexts) {
    input.push({
      type: "file",
      file_path: context.path,
      file_content: context.content
    });
  }
  const userParts = [];
  if (options.userQuery) {
    userParts.push({ type: "input_text", text: options.userQuery });
  }
  if (userParts.length > 0) {
    input.push({
      type: "message",
      role: "user",
      content: userParts
    });
  }
  const response = {
    model: "gpt-4o",
    input,
    tools: []
  };
  return {
    format: "oai-response",
    content: JSON.stringify(response, null, 2),
    metadata: response
  };
}

// src/ui/export-modal.ts
var ExportModal = class extends import_obsidian5.Modal {
  settings;
  contexts;
  onExport;
  constructor(app, settings, contexts, onExport) {
    super(app);
    this.settings = settings;
    this.contexts = contexts;
    this.onExport = onExport;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("goliath-export-modal");
    const i18n = t();
    contentEl.createEl("h2", { text: i18n.ui.exportTitle });
    const formatContainer = contentEl.createDiv({
      cls: "goliath-format-list"
    });
    for (const format of Object.keys(i18n.ui.exportFormatNames)) {
      const button = formatContainer.createEl("button", {
        text: i18n.ui.exportFormatNames[format],
        cls: "mod-cta"
      });
      button.style.marginBottom = "8px";
      button.style.display = "block";
      button.style.width = "100%";
      button.addEventListener("click", () => this.exportFormat(format));
    }
    const cancelButton = contentEl.createEl("button", { text: i18n.ui.cancel });
    cancelButton.style.marginTop = "12px";
    cancelButton.addEventListener("click", () => this.close());
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
  exportFormat(format) {
    const options = {
      includeFrontmatter: this.settings.includeFrontmatter,
      systemPrompt: this.settings.systemPrompt
    };
    let result;
    switch (format) {
      case "claude-code":
        result = generateClaudeCodeFormat(this.contexts, options);
        break;
      case "kimi-code":
        result = generateKimiCodeFormat(this.contexts, options);
        break;
      case "kimi-stream-json":
        result = generateKimiStreamJsonFormat(this.contexts, options);
        break;
      case "oai-chat":
        result = generateOaiChatFormat(this.contexts, options);
        break;
      case "oai-response":
        result = generateOaiResponseFormat(this.contexts, options);
        break;
      default:
        result = generateClaudeCodeFormat(this.contexts, options);
    }
    const i18n = t();
    const formatName = i18n.ui.exportFormatNames[format] ?? format;
    if (this.onExport) {
      this.onExport(result.content, format);
    } else {
      navigator.clipboard.writeText(result.content);
      new import_obsidian5.Notice(formatTemplate(i18n.ui.copiedToClipboard, { format: formatName }));
    }
    this.close();
  }
};

// src/utils/vault-helpers.ts
var import_obsidian6 = require("obsidian");
async function readFileContent(vault, file) {
  return vault.cachedRead(file);
}
function getFrontmatter(metadataCache, file) {
  const cache = metadataCache.getFileCache(file);
  if (!cache?.frontmatter)
    return void 0;
  return cache.frontmatter;
}
async function buildFileContext(vault, metadataCache, file, includeFrontmatter) {
  const content = await readFileContent(vault, file);
  const frontmatter = includeFrontmatter ? getFrontmatter(metadataCache, file) : void 0;
  return {
    path: file.path,
    content,
    frontmatter
  };
}
function getLinkedFiles(metadataCache, file, vault, depth = 1) {
  if (depth <= 0)
    return [];
  const cache = metadataCache.getFileCache(file);
  const links = cache?.links ?? [];
  const result = [];
  for (const link of links) {
    const linkedFile = metadataCache.getFirstLinkpathDest(link.link, file.path);
    if (linkedFile instanceof import_obsidian6.TFile) {
      result.push(linkedFile);
      if (depth > 1) {
        result.push(...getLinkedFiles(metadataCache, linkedFile, vault, depth - 1));
      }
    }
  }
  return [...new Set(result)];
}
async function buildContextWithLinked(vault, metadataCache, file, includeFrontmatter, includeLinked, maxDepth) {
  const contexts = [];
  contexts.push(await buildFileContext(vault, metadataCache, file, includeFrontmatter));
  if (includeLinked) {
    const linked = getLinkedFiles(metadataCache, file, vault, maxDepth);
    for (const linkedFile of linked) {
      if (linkedFile.path !== file.path) {
        contexts.push(
          await buildFileContext(vault, metadataCache, linkedFile, includeFrontmatter)
        );
      }
    }
  }
  return contexts;
}

// src/api/base-client.ts
var BaseApiClient = class {
  apiKey;
  baseUrl;
  model;
  constructor(apiKey, baseUrl, model) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.model = model;
  }
  async post(url, body) {
    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => "No error details");
      console.error(`[Goliath] API error: ${response.status} ${response.statusText}`, {
        url,
        model: this.model,
        status: response.status,
        body: errorText
      });
      throw new Error(`API error ${response.status} (${response.statusText}): ${errorText}`);
    }
    return response;
  }
  getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`
    };
  }
};

// src/api/anthropic-client.ts
var AnthropicClient = class extends BaseApiClient {
  async chat(request) {
    const anthropicRequest = this.toAnthropicRequest(request);
    const response = await this.post(
      `${this.baseUrl}/v1/messages`,
      anthropicRequest
    );
    const data = await response.json();
    const textBlocks = data.content.filter(
      (block) => block.type === "text" && typeof block.text === "string"
    );
    const text = textBlocks.map((block) => block.text).join("");
    const toolCalls = this.parseToolCalls(data.content);
    return {
      content: text,
      toolCalls: toolCalls.length > 0 ? toolCalls : void 0,
      usage: data.usage ? {
        inputTokens: data.usage.input_tokens,
        outputTokens: data.usage.output_tokens
      } : void 0
    };
  }
  async streamChat(request, onChunk) {
    const anthropicRequest = this.toAnthropicRequest(request);
    anthropicRequest.stream = true;
    const response = await this.post(
      `${this.baseUrl}/v1/messages`,
      anthropicRequest
    );
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }
    let fullText = "";
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done)
        break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (!line.startsWith("data: "))
          continue;
        const data = line.slice(6);
        if (data === "[DONE]")
          continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === "content_block_delta" && parsed.delta?.text) {
            fullText += parsed.delta.text;
            onChunk(parsed.delta.text);
          }
        } catch (parseError) {
          console.error("[Goliath] Failed to parse Anthropic stream chunk:", {
            line: data,
            error: parseError instanceof Error ? parseError.message : String(parseError)
          });
        }
      }
    }
    return { content: fullText };
  }
  toAnthropicRequest(request) {
    const systemMessage = request.messages.find((m) => m.role === "system");
    const otherMessages = request.messages.filter((m) => m.role !== "system");
    const result = {
      model: this.model,
      max_tokens: request.maxTokens ?? 4096,
      messages: otherMessages.map((m) => this.toAnthropicMessage(m)),
      system: systemMessage?.content,
      temperature: request.temperature ?? 0.7
    };
    if (request.tools && request.tools.length > 0) {
      result.tools = request.tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.parameters
      }));
    }
    return result;
  }
  toAnthropicMessage(message) {
    if (message.role === "tool" && message.toolCallId) {
      return {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: message.toolCallId,
            content: message.content
          }
        ]
      };
    }
    if (message.role === "assistant" && message.toolCalls && message.toolCalls.length > 0) {
      const content = [];
      if (message.content) {
        content.push({ type: "text", text: message.content });
      }
      for (const tc of message.toolCalls) {
        content.push({
          type: "tool_use",
          id: tc.id,
          name: tc.name,
          input: tc.arguments
        });
      }
      return {
        role: "assistant",
        content
      };
    }
    return {
      role: message.role,
      content: message.content
    };
  }
  parseToolCalls(content) {
    return content.filter((block) => block.type === "tool_use").map((block) => ({
      id: block.id,
      name: block.name,
      arguments: block.input
    }));
  }
  getHeaders() {
    return {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
      "anthropic-version": "2023-06-01"
    };
  }
};

// src/api/gemini-client.ts
var GeminiClient = class extends BaseApiClient {
  async chat(request) {
    const geminiRequest = this.toGeminiRequest(request);
    const response = await this.post(
      `${this.baseUrl}/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      geminiRequest
    );
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.filter((part) => typeof part.text === "string").map((part) => part.text).join("") ?? "";
    return {
      content: text,
      usage: data.usageMetadata ? {
        inputTokens: data.usageMetadata.promptTokenCount ?? 0,
        outputTokens: data.usageMetadata.candidatesTokenCount ?? 0
      } : void 0
    };
  }
  async streamChat(request, onChunk) {
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
      if (done)
        break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((line) => line.trim());
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          const text = parsed.candidates?.[0]?.content?.parts?.filter((part) => typeof part.text === "string").map((part) => part.text).join("") ?? "";
          if (text) {
            fullText += text;
            onChunk(text);
          }
        } catch (parseError) {
          console.error("[Goliath] Failed to parse Gemini stream chunk:", {
            line,
            error: parseError instanceof Error ? parseError.message : String(parseError)
          });
        }
      }
    }
    return { content: fullText };
  }
  toGeminiRequest(request) {
    const systemMessage = request.messages.find((m) => m.role === "system");
    const otherMessages = request.messages.filter((m) => m.role !== "system");
    const contents = [];
    for (const message of otherMessages) {
      contents.push({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }]
      });
    }
    const result = {
      contents,
      generationConfig: {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens ?? 4096
      }
    };
    if (systemMessage) {
      result.systemInstruction = {
        parts: [{ text: systemMessage.content }]
      };
    }
    return result;
  }
  getHeaders() {
    return {
      "Content-Type": "application/json"
    };
  }
};

// src/api/openai-client.ts
var OpenAiClient = class extends BaseApiClient {
  async chat(request) {
    const openAiRequest = this.toOpenAiRequest(request);
    const response = await this.post(
      `${this.baseUrl}/chat/completions`,
      openAiRequest
    );
    const data = await response.json();
    const message = data.choices?.[0]?.message;
    const toolCalls = this.parseToolCalls(message?.tool_calls);
    return {
      content: message?.content ?? "",
      toolCalls: toolCalls.length > 0 ? toolCalls : void 0,
      usage: data.usage ? {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens
      } : void 0
    };
  }
  async streamChat(request, onChunk) {
    const openAiRequest = this.toOpenAiRequest(request);
    openAiRequest.stream = true;
    const response = await this.post(
      `${this.baseUrl}/chat/completions`,
      openAiRequest
    );
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }
    let fullText = "";
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done)
        break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (!line.startsWith("data: "))
          continue;
        const data = line.slice(6);
        if (data === "[DONE]")
          continue;
        try {
          const parsed = JSON.parse(data);
          const text = parsed.choices?.[0]?.delta?.content ?? "";
          if (text) {
            fullText += text;
            onChunk(text);
          }
        } catch (parseError) {
          console.error("[Goliath] Failed to parse OpenAI stream chunk:", {
            line: data,
            error: parseError instanceof Error ? parseError.message : String(parseError)
          });
        }
      }
    }
    return { content: fullText };
  }
  toOpenAiRequest(request) {
    const result = {
      model: this.model,
      messages: request.messages.map((m) => this.toOpenAiMessage(m)),
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 4096
    };
    if (request.tools && request.tools.length > 0) {
      result.tools = request.tools.map((tool) => ({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        }
      }));
    }
    return result;
  }
  toOpenAiMessage(message) {
    const result = {
      role: message.role,
      content: message.content
    };
    if (message.toolCalls && message.toolCalls.length > 0) {
      result.tool_calls = message.toolCalls.map((tc) => ({
        id: tc.id,
        type: "function",
        function: {
          name: tc.name,
          arguments: JSON.stringify(tc.arguments)
        }
      }));
    }
    if (message.toolCallId) {
      result.tool_call_id = message.toolCallId;
    }
    return result;
  }
  parseToolCalls(toolCalls) {
    if (!toolCalls)
      return [];
    return toolCalls.filter((tc) => tc.type === "function").map((tc) => {
      let args;
      try {
        args = JSON.parse(tc.function.arguments);
      } catch {
        args = {};
      }
      return {
        id: tc.id,
        name: tc.function.name,
        arguments: args
      };
    });
  }
};

// src/core/session-manager.ts
var import_obsidian7 = require("obsidian");
var SESSIONS_FOLDER = "goliath-sessions";
var SessionManager = class {
  constructor(app) {
    this.app = app;
  }
  async saveSession(session) {
    await this.ensureFolder();
    const fileName = `${SESSIONS_FOLDER}/${session.id}.md`;
    const content = this.serializeSession(session);
    const existing = this.app.vault.getAbstractFileByPath(fileName);
    if (existing instanceof import_obsidian7.TFile) {
      await this.app.vault.modify(existing, content);
    } else {
      await this.app.vault.create(fileName, content);
    }
  }
  async loadSession(sessionId) {
    const fileName = `${SESSIONS_FOLDER}/${sessionId}.md`;
    const file = this.app.vault.getAbstractFileByPath(fileName);
    if (!file || !(file instanceof import_obsidian7.TFile))
      return null;
    const content = await this.app.vault.cachedRead(file);
    return this.deserializeSession(sessionId, content);
  }
  async listSessions() {
    const files = this.app.vault.getMarkdownFiles().filter(
      (f) => f.path.startsWith(`${SESSIONS_FOLDER}/`)
    );
    const sessions = [];
    for (const file of files) {
      const id = file.basename;
      const content = await this.app.vault.cachedRead(file);
      const session = this.deserializeSession(id, content);
      if (session)
        sessions.push(session);
    }
    return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  }
  async deleteSession(sessionId) {
    const fileName = `${SESSIONS_FOLDER}/${sessionId}.md`;
    const file = this.app.vault.getAbstractFileByPath(fileName);
    if (file) {
      await this.app.vault.delete(file);
    }
  }
  async ensureFolder() {
    const folder = this.app.vault.getAbstractFileByPath(SESSIONS_FOLDER);
    if (!folder) {
      await this.app.vault.createFolder(SESSIONS_FOLDER);
    }
  }
  serializeSession(session) {
    const frontmatter = [
      `---`,
      `id: ${session.id}`,
      `title: ${session.title}`,
      `createdAt: ${session.createdAt}`,
      `updatedAt: ${session.updatedAt}`,
      session.model ? `model: ${session.model}` : "",
      session.provider ? `provider: ${session.provider}` : "",
      `---`,
      ``
    ].filter(Boolean).join("\n");
    const messages = session.messages.map((msg) => {
      const prefix = msg.role === "user" ? "## User" : msg.role === "assistant" ? "## Assistant" : msg.role === "system" ? "## System" : "## Tool";
      return `${prefix}

${msg.content}`;
    }).join("\n\n---\n\n");
    return `${frontmatter}
${messages}`;
  }
  deserializeSession(id, content) {
    const lines = content.split("\n");
    let inFrontmatter = false;
    let frontmatterEnd = 0;
    const metadata = {};
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === "---") {
        if (!inFrontmatter) {
          inFrontmatter = true;
        } else {
          frontmatterEnd = i;
          break;
        }
        continue;
      }
      if (inFrontmatter) {
        const colonIndex = line.indexOf(":");
        if (colonIndex > 0) {
          const key = line.slice(0, colonIndex).trim();
          const value = line.slice(colonIndex + 1).trim();
          metadata[key] = value;
        }
      }
    }
    const body = lines.slice(frontmatterEnd + 1).join("\n").trim();
    const messages = this.parseMessages(body);
    return {
      id: metadata.id || id,
      title: metadata.title || "Untitled Session",
      messages,
      createdAt: parseInt(metadata.createdAt || "0"),
      updatedAt: parseInt(metadata.updatedAt || "0"),
      model: metadata.model,
      provider: metadata.provider
    };
  }
  parseMessages(body) {
    const messages = [];
    const sections = body.split(/\n---\n/);
    for (const section of sections) {
      const trimmed = section.trim();
      if (!trimmed)
        continue;
      const match = trimmed.match(/^##\s*(User|Assistant|System|Tool)\n\n?([\s\S]*)$/);
      if (match) {
        const roleMap = {
          User: "user",
          Assistant: "assistant",
          System: "system",
          Tool: "tool"
        };
        messages.push({
          role: roleMap[match[1]] || "user",
          content: match[2].trim()
        });
      }
    }
    return messages;
  }
};

// src/main.ts
var GOLIATH_ICON = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
  <path d="M2 17l10 5 10-5"/>
  <path d="M2 12l10 5 10-5"/>
</svg>
`;
var GoliathPlugin = class extends import_obsidian8.Plugin {
  settings;
  sessionManager;
  async onload() {
    this.sessionManager = new SessionManager(this.app);
    await this.loadSettings();
    setLanguage(this.settings.language);
    (0, import_obsidian8.addIcon)("goliath", GOLIATH_ICON);
    this.registerView(
      VIEW_TYPE_GOLIATH_CHAT,
      (leaf) => new ChatView(leaf)
    );
    const i18n = t();
    this.addCommand({
      id: "open-goliath-chat",
      name: i18n.commands.openChat,
      callback: () => this.openChatView()
    });
    this.addCommand({
      id: "export-current-note",
      name: i18n.commands.exportNote,
      editorCallback: () => this.exportCurrentNote()
    });
    this.addCommand({
      id: "chat-with-current-note",
      name: i18n.commands.chatWithNote,
      editorCallback: () => this.chatWithCurrentNote()
    });
    this.addRibbonIcon("goliath", i18n.ui.chatViewTitle, () => {
      this.openChatView();
    });
    this.addSettingTab(new GoliathSettingTab(this.app, this));
  }
  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_GOLIATH_CHAT);
  }
  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async openChatView() {
    try {
      const { workspace } = this.app;
      let leaf = workspace.getLeavesOfType(VIEW_TYPE_GOLIATH_CHAT)[0];
      if (!leaf) {
        leaf = workspace.getRightLeaf(false);
        await leaf.setViewState({
          type: VIEW_TYPE_GOLIATH_CHAT,
          active: true
        });
      }
      workspace.revealLeaf(leaf);
      await this.configureChatView(leaf);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[Goliath] Failed to open chat view:", message);
      new import_obsidian8.Notice(`Goliath error: ${message}`, 5e3);
    }
  }
  async configureChatView(leaf) {
    try {
      const view = leaf.view;
      if (!(view instanceof ChatView))
        return;
      view.setApp(this.app);
      const client = await this.createApiClient(this.settings.defaultProvider);
      if (client) {
        view.setApiClient(client);
      }
      view.setSystemPrompt(this.settings.systemPrompt);
      const providerConfig = this.settings[this.settings.defaultProvider];
      const providerName = t().ui.providerNames[this.settings.defaultProvider] ?? this.settings.defaultProvider;
      view.setModelInfo(providerName, providerConfig.model, async () => {
        const providers = ["anthropic", "gemini", "kimi", "local"];
        const enabledProviders = providers.filter((p) => this.settings[p].enabled);
        if (enabledProviders.length <= 1) {
          new import_obsidian8.Notice("No other providers enabled", 3e3);
          return;
        }
        const currentIndex = enabledProviders.indexOf(this.settings.defaultProvider);
        const nextIndex = (currentIndex + 1) % enabledProviders.length;
        const nextProvider = enabledProviders[nextIndex];
        this.settings.defaultProvider = nextProvider;
        await this.saveSettings();
        await this.configureChatView(leaf);
        const nextProviderName = t().ui.providerNames[nextProvider] ?? nextProvider;
        new import_obsidian8.Notice(`Switched to ${nextProviderName}`, 3e3);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[Goliath] Failed to configure chat view:", message);
      new import_obsidian8.Notice(`Goliath error: ${message}`, 5e3);
    }
  }
  async exportCurrentNote() {
    try {
      const file = this.app.workspace.getActiveFile();
      if (!file) {
        new import_obsidian8.Notice(t().ui.noActiveNote);
        return;
      }
      const contexts = await buildContextWithLinked(
        this.app.vault,
        this.app.metadataCache,
        file,
        this.settings.includeFrontmatter,
        this.settings.includeLinkedNotes,
        this.settings.maxLinkedDepth
      );
      new ExportModal(this.app, this.settings, contexts, (text, format) => {
        navigator.clipboard.writeText(text);
        const formatName = t().ui.exportFormatNames[format] ?? format;
        new import_obsidian8.Notice(formatTemplate(t().ui.copiedToClipboard, { format: formatName }));
      }).open();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[Goliath] Failed to export note:", message);
      new import_obsidian8.Notice(`Goliath error: ${message}`, 5e3);
    }
  }
  async chatWithCurrentNote() {
    try {
      const file = this.app.workspace.getActiveFile();
      if (!file) {
        new import_obsidian8.Notice(t().ui.noActiveNote);
        return;
      }
      await this.openChatView();
      const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_GOLIATH_CHAT)[0];
      if (!leaf)
        return;
      const view = leaf.view;
      if (!(view instanceof ChatView))
        return;
      const contexts = await buildContextWithLinked(
        this.app.vault,
        this.app.metadataCache,
        file,
        this.settings.includeFrontmatter,
        this.settings.includeLinkedNotes,
        this.settings.maxLinkedDepth
      );
      const contextText = contexts.map((ctx) => `File: ${ctx.path}
${ctx.content}`).join("\n\n---\n\n");
      view.setSystemPrompt(this.settings.systemPrompt);
      console.log("[Goliath] Chat context built:", {
        file: file.path,
        contextChunks: contexts.length,
        contextLength: contextText.length
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[Goliath] Failed to chat with note:", message);
      new import_obsidian8.Notice(`Goliath error: ${message}`, 5e3);
    }
  }
  async createApiClient(provider) {
    const config = this.settings[provider];
    if (!config.enabled) {
      const providerName = t().ui.providerNames[provider] ?? provider;
      new import_obsidian8.Notice(formatTemplate(t().ui.providerNotConfigured, { provider: providerName }));
      return null;
    }
    let apiKey = config.apiKey;
    if (provider === "kimi") {
      try {
        const storage = {
          loadData: () => this.loadData(),
          saveData: (data2) => this.saveData(data2)
        };
        const data = await this.loadData();
        let deviceId = data?.kimiDeviceId;
        if (typeof deviceId !== "string" || !deviceId) {
          deviceId = crypto.randomUUID();
          await this.saveData({ ...data, kimiDeviceId: deviceId });
        }
        const tokens = await ensureFreshTokens(storage, deviceId);
        if (tokens) {
          apiKey = tokens.accessToken;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("[Goliath] Kimi OAuth error:", message);
        new import_obsidian8.Notice(`Kimi login error: ${message}`, 5e3);
      }
    }
    if (!apiKey) {
      const providerName = t().ui.providerNames[provider] ?? provider;
      new import_obsidian8.Notice(formatTemplate(t().ui.providerNotConfigured, { provider: providerName }));
      return null;
    }
    switch (provider) {
      case "anthropic":
        return new AnthropicClient(apiKey, config.baseUrl, config.model);
      case "gemini":
        return new GeminiClient(apiKey, config.baseUrl, config.model);
      case "kimi":
        return new OpenAiClient(apiKey, config.baseUrl, config.model);
      case "local":
        return new OpenAiClient(apiKey, config.baseUrl, config.model);
      default:
        return null;
    }
  }
};
