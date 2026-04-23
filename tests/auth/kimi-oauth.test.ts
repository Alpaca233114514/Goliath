import {
  KimiOAuthError,
  KimiOAuthUnauthorized,
  KimiOAuthDeviceExpired,
  validateUrl,
  getOAuthHost,
  generateEncryptionKey,
  encryptTokens,
  decryptTokens,
  saveTokens,
  loadTokens,
  deleteTokens,
  requestDeviceAuthorization,
  refreshAccessToken,
  loginKimiCode,
  ensureFreshTokens,
  type KimiTokens,
  type DataStorage,
  type DeviceAuthorization,
} from "../../src/auth/kimi-oauth";

function createMockStorage(): DataStorage {
  let data: Record<string, unknown> = {};
  return {
    loadData: jest.fn().mockImplementation(async () => data),
    saveData: jest.fn().mockImplementation(async (d) => {
      data = d as Record<string, unknown>;
    }),
  };
}

describe("validateUrl", () => {
  it("should accept allowed HTTPS hosts", () => {
    expect(() =>
      validateUrl("https://auth.kimi.com/api/oauth/token")
    ).not.toThrow();
    expect(() =>
      validateUrl("https://api.kimi.com/v1/chat/completions")
    ).not.toThrow();
  });

  it("should reject HTTP URLs", () => {
    expect(() => validateUrl("http://auth.kimi.com/api")).toThrow(
      KimiOAuthError
    );
  });

  it("should reject disallowed hosts", () => {
    expect(() => validateUrl("https://evil.com/api")).toThrow(KimiOAuthError);
    expect(() => validateUrl("https://auth.kimi.com.evil.com/api")).toThrow(
      KimiOAuthError
    );
  });

  it("should reject invalid URLs", () => {
    expect(() => validateUrl("not-a-url")).toThrow(KimiOAuthError);
  });
});

describe("getOAuthHost", () => {
  it("should return the default OAuth host", () => {
    expect(getOAuthHost()).toBe("https://auth.kimi.com");
  });
});

describe("encryption", () => {
  it("should encrypt and decrypt tokens", () => {
    const tokens: KimiTokens = {
      accessToken: "access_123",
      refreshToken: "refresh_456",
      expiresAt: 1234567890,
      scope: "read write",
      tokenType: "Bearer",
    };
    const key = generateEncryptionKey();
    const encrypted = encryptTokens(tokens, key);
    const decrypted = decryptTokens(encrypted, key);
    expect(decrypted).toEqual(tokens);
  });

  it("should fail decryption with wrong key", () => {
    const tokens: KimiTokens = {
      accessToken: "access_123",
      refreshToken: "refresh_456",
      expiresAt: 1234567890,
      scope: "read",
      tokenType: "Bearer",
    };
    const key = generateEncryptionKey();
    const wrongKey = generateEncryptionKey();
    const encrypted = encryptTokens(tokens, key);
    expect(() => decryptTokens(encrypted, wrongKey)).toThrow();
  });

  it("should fail decryption with tampered ciphertext", () => {
    const tokens: KimiTokens = {
      accessToken: "access_123",
      refreshToken: "refresh_456",
      expiresAt: 1234567890,
      scope: "read",
      tokenType: "Bearer",
    };
    const key = generateEncryptionKey();
    const encrypted = encryptTokens(tokens, key);
    encrypted.ciphertext = encrypted.ciphertext.slice(0, -4) + "abcd";
    expect(() => decryptTokens(encrypted, key)).toThrow();
  });
});

describe("token storage", () => {
  it("should save and load tokens", async () => {
    const storage = createMockStorage();
    const tokens: KimiTokens = {
      accessToken: "acc_123",
      refreshToken: "ref_456",
      expiresAt: 9999999999,
      scope: "read",
      tokenType: "Bearer",
    };
    await saveTokens(tokens, storage);
    const loaded = await loadTokens(storage);
    expect(loaded).toEqual(tokens);
  });

  it("should return null when no tokens exist", async () => {
    const storage = createMockStorage();
    const loaded = await loadTokens(storage);
    expect(loaded).toBeNull();
  });

  it("should delete tokens", async () => {
    const storage = createMockStorage();
    const tokens: KimiTokens = {
      accessToken: "acc_123",
      refreshToken: "ref_456",
      expiresAt: 9999999999,
      scope: "read",
      tokenType: "Bearer",
    };
    await saveTokens(tokens, storage);
    await deleteTokens(storage);
    const loaded = await loadTokens(storage);
    expect(loaded).toBeNull();
  });

  it("should return null when decryption fails", async () => {
    const storage = createMockStorage();
    await saveTokens(
      {
        accessToken: "a",
        refreshToken: "r",
        expiresAt: 1,
        scope: "s",
        tokenType: "t",
      },
      storage
    );
    const data = (await storage.loadData()) as Record<string, unknown>;
    const store = data.kimi_oauth_tokens as {
      encrypted: { ciphertext: string; iv: string; tag: string };
    };
    store.encrypted.ciphertext = "invalid";
    const loaded = await loadTokens(storage);
    expect(loaded).toBeNull();
  });

  it("should handle deleteTokens when data is undefined", async () => {
    const storage = {
      loadData: jest.fn().mockResolvedValue(undefined),
      saveData: jest.fn().mockResolvedValue(undefined),
    };
    await expect(deleteTokens(storage)).resolves.toBeUndefined();
  });

  it("should return null when encryption key length is invalid", async () => {
    const storage = createMockStorage();
    await saveTokens(
      {
        accessToken: "a",
        refreshToken: "r",
        expiresAt: 1,
        scope: "s",
        tokenType: "t",
      },
      storage
    );
    const data = (await storage.loadData()) as Record<string, unknown>;
    data.kimi_oauth_key = "short"; // base64 decoded length != 32
    const loaded = await loadTokens(storage);
    expect(loaded).toBeNull();
  });

  it("should return null when storage data is undefined", async () => {
    const storage = {
      loadData: jest.fn().mockResolvedValue(undefined),
      saveData: jest.fn().mockResolvedValue(undefined),
    };
    const loaded = await loadTokens(storage);
    expect(loaded).toBeNull();
  });
});

describe("requestDeviceAuthorization", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should request device authorization successfully", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        user_code: "ABCD-EFGH",
        device_code: "dev_123",
        verification_uri: "https://auth.kimi.com/verify",
        verification_uri_complete: "https://auth.kimi.com/verify?code=ABCD-EFGH",
        expires_in: 1800,
        interval: 5,
      }),
    };
    jest.spyOn(global, "fetch").mockResolvedValue(mockResponse as unknown as Response);

    const result = await requestDeviceAuthorization("device_123");
    expect(result.userCode).toBe("ABCD-EFGH");
    expect(result.deviceCode).toBe("dev_123");
    expect(result.verificationUri).toBe("https://auth.kimi.com/verify");
    expect(result.interval).toBe(5);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://auth.kimi.com/api/oauth/device_authorization",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-Msh-Platform": "obsidian_goliath",
          "X-Msh-Device-Id": "device_123",
        }),
      })
    );
  });

  it("should throw on error response", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({ error: "invalid_request" }),
    };
    jest.spyOn(global, "fetch").mockResolvedValue(mockResponse as unknown as Response);

    await expect(requestDeviceAuthorization("device_123")).rejects.toThrow(
      KimiOAuthError
    );
  });
});

describe("refreshAccessToken", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should refresh token successfully", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        access_token: "new_access",
        refresh_token: "new_refresh",
        expires_in: 3600,
        scope: "read",
        token_type: "Bearer",
      }),
    };
    jest.spyOn(global, "fetch").mockResolvedValue(mockResponse as unknown as Response);

    const result = await refreshAccessToken("old_refresh", "device_123");
    expect(result.accessToken).toBe("new_access");
    expect(result.refreshToken).toBe("new_refresh");
  });

  it("should throw KimiOAuthUnauthorized on 401", async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue({
        error: "invalid_grant",
        error_description: "Refresh token revoked.",
      }),
    };
    jest.spyOn(global, "fetch").mockResolvedValue(mockResponse as unknown as Response);

    await expect(
      refreshAccessToken("old_refresh", "device_123")
    ).rejects.toThrow(KimiOAuthUnauthorized);
  });

  it("should throw KimiOAuthUnauthorized on 403", async () => {
    const mockResponse = {
      ok: false,
      status: 403,
      json: jest.fn().mockResolvedValue({ error: "access_denied" }),
    };
    jest.spyOn(global, "fetch").mockResolvedValue(mockResponse as unknown as Response);

    await expect(
      refreshAccessToken("old_refresh", "device_123")
    ).rejects.toThrow(KimiOAuthUnauthorized);
  });
});

describe("loginKimiCode", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should yield events and return tokens on success", async () => {
    const authResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        user_code: "USER-CODE",
        device_code: "dev_123",
        verification_uri: "https://auth.kimi.com/verify",
        verification_uri_complete: "https://auth.kimi.com/verify?code=USER-CODE",
        expires_in: 1800,
        interval: 1,
      }),
    };

    const tokenResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        access_token: "access_123",
        refresh_token: "refresh_456",
        expires_in: 3600,
        scope: "read",
        token_type: "Bearer",
      }),
    };

    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(authResponse as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 400,
        json: jest.fn().mockResolvedValue({
          error: "authorization_pending",
        }),
      } as unknown as Response)
      .mockResolvedValueOnce(tokenResponse as unknown as Response);

    const events: Array<{ type: string; message: string }> = [];
    const sleepMock = jest.fn().mockResolvedValue(undefined);
    const generator = loginKimiCode("device_123", { sleepMs: sleepMock });

    for await (const event of generator) {
      events.push({ type: event.type, message: event.message });
    }

    expect(events.some((e) => e.type === "verification_url")).toBe(true);
    expect(events.some((e) => e.type === "success")).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("should handle device code expiration and retry", async () => {
    const authResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        user_code: "USER1",
        device_code: "dev_1",
        verification_uri: "https://auth.kimi.com/verify",
        verification_uri_complete: "https://auth.kimi.com/verify?code=USER1",
        expires_in: 1800,
        interval: 1,
      }),
    };

    const secondAuthResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        user_code: "USER2",
        device_code: "dev_2",
        verification_uri: "https://auth.kimi.com/verify",
        verification_uri_complete: "https://auth.kimi.com/verify?code=USER2",
        expires_in: 1800,
        interval: 1,
      }),
    };

    const tokenResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        access_token: "access_final",
        refresh_token: "refresh_final",
        expires_in: 3600,
        scope: "read",
        token_type: "Bearer",
      }),
    };

    jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(authResponse as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 400,
        json: jest.fn().mockResolvedValue({
          error: "expired_token",
        }),
      } as unknown as Response)
      .mockResolvedValueOnce(secondAuthResponse as unknown as Response)
      .mockResolvedValueOnce(tokenResponse as unknown as Response);

    const events: Array<{ type: string }> = [];
    const sleepMock = jest.fn().mockResolvedValue(undefined);
    const generator = loginKimiCode("device_123", { sleepMs: sleepMock });

    for await (const event of generator) {
      events.push({ type: event.type });
    }

    expect(events.filter((e) => e.type === "verification_url")).toHaveLength(2);
    expect(events.some((e) => e.type === "success")).toBe(true);
  });

  it("should throw on request device authorization failure", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue({ error: "server_error" }),
    } as unknown as Response);

    const generator = loginKimiCode("device_123");
    await expect(async () => {
      for await (const _ of generator) {
        // consume
      }
    }).rejects.toThrow(KimiOAuthError);
  });

  it("should ignore openBrowser errors", async () => {
    const authResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        user_code: "USER",
        device_code: "dev_1",
        verification_uri: "https://auth.kimi.com/verify",
        verification_uri_complete: "https://auth.kimi.com/verify?code=USER",
        expires_in: 1800,
        interval: 1,
      }),
    };
    const tokenResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        access_token: "access_final",
        refresh_token: "refresh_final",
        expires_in: 3600,
        scope: "read",
        token_type: "Bearer",
      }),
    };
    jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(authResponse as unknown as Response)
      .mockResolvedValueOnce(tokenResponse as unknown as Response);

    const openBrowser = jest.fn().mockImplementation(() => {
      throw new Error("Browser open failed");
    });
    const generator = loginKimiCode("device_123", {
      openBrowser,
      sleepMs: () => Promise.resolve(),
    });

    const events: Array<{ type: string }> = [];
    for await (const event of generator) {
      events.push({ type: event.type });
    }
    expect(events.some((e) => e.type === "success")).toBe(true);
  });

  it("should throw when token polling fetch fails", async () => {
    const authResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        user_code: "USER",
        device_code: "dev_1",
        verification_uri: "https://auth.kimi.com/verify",
        verification_uri_complete: "https://auth.kimi.com/verify?code=USER",
        expires_in: 1800,
        interval: 1,
      }),
    };
    jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(authResponse as unknown as Response)
      .mockRejectedValueOnce(new Error("Network error"));

    const generator = loginKimiCode("device_123", {
      sleepMs: () => Promise.resolve(),
    });
    await expect(async () => {
      for await (const _ of generator) {
        // consume
      }
    }).rejects.toThrow(KimiOAuthError);
  });

  it("should throw when token polling returns server error", async () => {
    const authResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        user_code: "USER",
        device_code: "dev_1",
        verification_uri: "https://auth.kimi.com/verify",
        verification_uri_complete: "https://auth.kimi.com/verify?code=USER",
        expires_in: 1800,
        interval: 1,
      }),
    };
    jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(authResponse as unknown as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: jest.fn().mockResolvedValue({ error: "server_error" }),
      } as unknown as Response);

    const generator = loginKimiCode("device_123", {
      sleepMs: () => Promise.resolve(),
    });
    await expect(async () => {
      for await (const _ of generator) {
        // consume
      }
    }).rejects.toThrow(KimiOAuthError);
  });
});

describe("ensureFreshTokens", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return null when no tokens exist", async () => {
    const storage = createMockStorage();
    const result = await ensureFreshTokens(storage, "device_123");
    expect(result).toBeNull();
  });

  it("should return existing tokens if not expired", async () => {
    const storage = createMockStorage();
    const tokens: KimiTokens = {
      accessToken: "acc",
      refreshToken: "ref",
      expiresAt: Date.now() / 1000 + 1000,
      scope: "read",
      tokenType: "Bearer",
    };
    await saveTokens(tokens, storage);
    const result = await ensureFreshTokens(storage, "device_123", 300);
    expect(result?.accessToken).toBe("acc");
  });

  it("should refresh tokens when close to expiry", async () => {
    const storage = createMockStorage();
    const tokens: KimiTokens = {
      accessToken: "old_acc",
      refreshToken: "old_ref",
      expiresAt: Date.now() / 1000 + 10,
      scope: "read",
      tokenType: "Bearer",
    };
    await saveTokens(tokens, storage);

    const mockResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        access_token: "new_acc",
        refresh_token: "new_ref",
        expires_in: 3600,
        scope: "read",
        token_type: "Bearer",
      }),
    };
    jest.spyOn(global, "fetch").mockResolvedValue(mockResponse as unknown as Response);

    const result = await ensureFreshTokens(storage, "device_123", 300);
    expect(result?.accessToken).toBe("new_acc");
    expect(result?.refreshToken).toBe("new_ref");
  });

  it("should delete tokens and return null on 401 during refresh", async () => {
    const storage = createMockStorage();
    const tokens: KimiTokens = {
      accessToken: "old_acc",
      refreshToken: "old_ref",
      expiresAt: Date.now() / 1000 + 10,
      scope: "read",
      tokenType: "Bearer",
    };
    await saveTokens(tokens, storage);

    const mockResponse = {
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue({ error: "invalid_grant" }),
    };
    jest.spyOn(global, "fetch").mockResolvedValue(mockResponse as unknown as Response);

    const result = await ensureFreshTokens(storage, "device_123", 300);
    expect(result).toBeNull();

    const loaded = await loadTokens(storage);
    expect(loaded).toBeNull();
  });

  it("should return null when token has no refresh token", async () => {
    const storage = createMockStorage();
    const tokens: KimiTokens = {
      accessToken: "old_acc",
      refreshToken: "",
      expiresAt: Date.now() / 1000 + 10,
      scope: "read",
      tokenType: "Bearer",
    };
    await saveTokens(tokens, storage);
    const result = await ensureFreshTokens(storage, "device_123", 300);
    expect(result).toBeNull();
  });

  it("should throw non-unauthorized errors during refresh", async () => {
    const storage = createMockStorage();
    const tokens: KimiTokens = {
      accessToken: "old_acc",
      refreshToken: "old_ref",
      expiresAt: Date.now() / 1000 + 10,
      scope: "read",
      tokenType: "Bearer",
    };
    await saveTokens(tokens, storage);

    const mockResponse = {
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue({ error: "server_error" }),
    };
    jest.spyOn(global, "fetch").mockResolvedValue(mockResponse as unknown as Response);

    await expect(
      ensureFreshTokens(storage, "device_123", 300)
    ).rejects.toThrow(KimiOAuthError);
  });
});

describe("error sanitization", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should redact tokens in error messages from device auth", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      json: jest
        .fn()
        .mockResolvedValue({
          error: "invalid_request",
          error_description: "Bad access_token=secret123 and refresh_token=secret456",
        }),
    };
    jest.spyOn(global, "fetch").mockResolvedValue(mockResponse as unknown as Response);

    try {
      await requestDeviceAuthorization("device_123");
    } catch (error) {
      const message = (error as Error).message;
      expect(message).toContain("access_token=<redacted>");
      expect(message).toContain("refresh_token=<redacted>");
      expect(message).not.toContain("secret123");
      expect(message).not.toContain("secret456");
    }
  });

  it("should redact tokens in error messages from refresh", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      json: jest
        .fn()
        .mockResolvedValue({
          error: "invalid_request",
          error_description: "Bad access_token=leaked and refresh_token=also_leaked",
        }),
    };
    jest.spyOn(global, "fetch").mockResolvedValue(mockResponse as unknown as Response);

    try {
      await refreshAccessToken("refresh_123", "device_123");
    } catch (error) {
      const message = (error as Error).message;
      expect(message).toContain("access_token=<redacted>");
      expect(message).toContain("refresh_token=<redacted>");
      expect(message).not.toContain("leaked");
    }
  });
});
