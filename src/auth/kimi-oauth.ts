import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

const KIMI_CLIENT_ID = "17e5f671-d194-4dfb-9706-5516cb48c098";
const DEFAULT_OAUTH_HOST = "https://auth.kimi.com";
const ALLOWED_HOSTS = ["auth.kimi.com", "api.kimi.com"];

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

export interface KimiTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
  tokenType: string;
}

export interface DeviceAuthorization {
  userCode: string;
  deviceCode: string;
  verificationUri: string;
  verificationUriComplete: string;
  expiresIn: number | null;
  interval: number;
}

export type OAuthEventType =
  | "info"
  | "error"
  | "waiting"
  | "verification_url"
  | "success";

export interface OAuthEvent {
  type: OAuthEventType;
  message: string;
  data?: Record<string, unknown>;
}

interface EncryptedTokenStore {
  ciphertext: string;
  iv: string;
  tag: string;
}

interface TokenStorage {
  key: string;
  encrypted: EncryptedTokenStore;
}

interface TokenPayload {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export class KimiOAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KimiOAuthError";
  }
}

export class KimiOAuthUnauthorized extends KimiOAuthError {
  constructor(message: string) {
    super(message);
    this.name = "KimiOAuthUnauthorized";
  }
}

export class KimiOAuthDeviceExpired extends KimiOAuthError {
  constructor(message: string) {
    super(message);
    this.name = "KimiOAuthDeviceExpired";
  }
}

export function getOAuthHost(): string {
  return DEFAULT_OAUTH_HOST;
}

export function validateUrl(url: string): void {
  let parsed: URL;
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

function getCommonHeaders(deviceId: string): Record<string, string> {
  return {
    "Content-Type": "application/x-www-form-urlencoded",
    "X-Msh-Platform": "obsidian_goliath",
    "X-Msh-Device-Id": deviceId,
  };
}

function sanitizeErrorMessage(message: string): string {
  return message
    .replace(/access_token=[^&\s]*/gi, "access_token=<redacted>")
    .replace(/refresh_token=[^&\s]*/gi, "refresh_token=<redacted>");
}

function tokensFromResponse(payload: TokenPayload): KimiTokens {
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: Date.now() / 1000 + payload.expires_in,
    scope: payload.scope,
    tokenType: payload.token_type,
  };
}

function tokensToJson(tokens: KimiTokens): string {
  return JSON.stringify({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: tokens.expiresAt,
    scope: tokens.scope,
    tokenType: tokens.tokenType,
  });
}

function tokensFromJson(text: string): KimiTokens {
  const parsed = JSON.parse(text) as Record<string, unknown>;
  return {
    accessToken: String(parsed.accessToken ?? ""),
    refreshToken: String(parsed.refreshToken ?? ""),
    expiresAt: Number(parsed.expiresAt ?? 0),
    scope: String(parsed.scope ?? ""),
    tokenType: String(parsed.tokenType ?? ""),
  };
}

export function generateEncryptionKey(): Buffer {
  return randomBytes(KEY_LENGTH);
}

export function encryptTokens(
  tokens: KimiTokens,
  key: Buffer
): EncryptedTokenStore {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const plaintext = tokensToJson(tokens);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
}

export function decryptTokens(
  store: EncryptedTokenStore,
  key: Buffer
): KimiTokens {
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(store.iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(store.tag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(store.ciphertext, "base64")),
    decipher.final(),
  ]);
  return tokensFromJson(decrypted.toString("utf8"));
}

export interface DataStorage {
  loadData(): Promise<unknown>;
  saveData(data: unknown): Promise<void>;
}

const STORAGE_KEY = "kimi_oauth_tokens";
const ENCRYPTION_KEY_KEY = "kimi_oauth_key";

async function loadStorageData(
  storage: DataStorage
): Promise<{ key: Buffer | null; tokenStore: TokenStorage | null }> {
  const data = (await storage.loadData()) as Record<string, unknown> | undefined;
  if (!data) {
    return { key: null, tokenStore: null };
  }

  const keyBase64 = data[ENCRYPTION_KEY_KEY];
  let key: Buffer | null = null;
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

  const tokenStore = data[STORAGE_KEY] as TokenStorage | undefined;
  return { key, tokenStore: tokenStore ?? null };
}

async function saveStorageData(
  storage: DataStorage,
  key: Buffer,
  tokenStore: TokenStorage
): Promise<void> {
  const data = (await storage.loadData()) as Record<string, unknown> | undefined;
  await storage.saveData({
    ...data,
    [ENCRYPTION_KEY_KEY]: key.toString("base64"),
    [STORAGE_KEY]: tokenStore,
  });
}

export async function saveTokens(
  tokens: KimiTokens,
  storage: DataStorage
): Promise<void> {
  let { key } = await loadStorageData(storage);
  if (!key) {
    key = generateEncryptionKey();
  }
  const encrypted = encryptTokens(tokens, key);
  await saveStorageData(storage, key, {
    key: STORAGE_KEY,
    encrypted,
  });
}

export async function loadTokens(
  storage: DataStorage
): Promise<KimiTokens | null> {
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

export async function deleteTokens(storage: DataStorage): Promise<void> {
  const data = (await storage.loadData()) as Record<string, unknown> | undefined;
  if (data) {
    delete data[STORAGE_KEY];
    delete data[ENCRYPTION_KEY_KEY];
    await storage.saveData(data);
  }
}

export async function requestDeviceAuthorization(
  deviceId: string
): Promise<DeviceAuthorization> {
  const host = getOAuthHost();
  const url = `${host}/api/oauth/device_authorization`;
  validateUrl(url);

  const body = new URLSearchParams({ client_id: KIMI_CLIENT_ID });

  const response = await fetch(url, {
    method: "POST",
    headers: getCommonHeaders(deviceId),
    body: body.toString(),
  });

  const data = (await response.json()) as Record<string, unknown>;

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
    expiresIn:
      typeof data.expires_in === "number" ? data.expires_in : null,
    interval: typeof data.interval === "number" ? data.interval : 5,
  };
}

async function requestDeviceToken(
  auth: DeviceAuthorization,
  deviceId: string
): Promise<{ status: number; data: Record<string, unknown> }> {
  const host = getOAuthHost();
  const url = `${host}/api/oauth/token`;
  validateUrl(url);

  const body = new URLSearchParams({
    client_id: KIMI_CLIENT_ID,
    device_code: auth.deviceCode,
    grant_type: "urn:ietf:params:oauth:grant-type:device_code",
  });

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: getCommonHeaders(deviceId),
      body: body.toString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new KimiOAuthError(
      sanitizeErrorMessage(`Token polling request failed: ${message}`)
    );
  }

  const data = (await response.json()) as Record<string, unknown>;

  if (response.status >= 500) {
    throw new KimiOAuthError(
      sanitizeErrorMessage(
        `Token polling server error: ${response.status}`
      )
    );
  }

  return { status: response.status, data };
}

export async function refreshAccessToken(
  refreshTokenValue: string,
  deviceId: string
): Promise<KimiTokens> {
  const host = getOAuthHost();
  const url = `${host}/api/oauth/token`;
  validateUrl(url);

  const body = new URLSearchParams({
    client_id: KIMI_CLIENT_ID,
    grant_type: "refresh_token",
    refresh_token: refreshTokenValue,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: getCommonHeaders(deviceId),
    body: body.toString(),
  });

  const data = (await response.json()) as Record<string, unknown>;

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

  return tokensFromResponse(data as unknown as TokenPayload);
}

export async function* loginKimiCode(
  deviceId: string,
  options: {
    openBrowser?: (url: string) => void;
    sleepMs?: (ms: number) => Promise<void>;
  } = {}
): AsyncGenerator<OAuthEvent, KimiTokens, unknown> {
  const { openBrowser, sleepMs = (ms) => new Promise((r) => setTimeout(r, ms)) } = options;

  while (true) {
    let auth: DeviceAuthorization;
    try {
      auth = await requestDeviceAuthorization(deviceId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      yield { type: "error", message: `Login failed: ${message}` };
      throw error;
    }

    yield {
      type: "info",
      message: "Please visit the following URL to finish authorization.",
    };
    yield {
      type: "verification_url",
      message: `Verification URL: ${auth.verificationUriComplete}`,
      data: {
        verification_url: auth.verificationUriComplete,
        user_code: auth.userCode,
      },
    };

    if (openBrowser) {
      try {
        openBrowser(auth.verificationUriComplete);
      } catch {
        // Ignore browser open errors
      }
    }

    const interval = Math.max(auth.interval, 1);
    let printedWait = false;

    try {
      while (true) {
        const { status, data } = await requestDeviceToken(auth, deviceId);
        if (status === 200 && data.access_token) {
          const tokens = tokensFromResponse(data as unknown as TokenPayload);
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
            data: { error: errorCode, error_description: errorDescription },
          };
          printedWait = true;
        }

        await sleepMs(interval * 1000);
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

export async function ensureFreshTokens(
  storage: DataStorage,
  deviceId: string,
  thresholdSeconds = 300
): Promise<KimiTokens | null> {
  const tokens = await loadTokens(storage);
  if (!tokens) {
    return null;
  }

  const now = Date.now() / 1000;
  if (
    tokens.expiresAt > now &&
    tokens.expiresAt - now >= thresholdSeconds
  ) {
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
