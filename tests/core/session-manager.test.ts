import { SessionManager } from "../../src/core/session-manager";
import { App, TFile, Vault } from "obsidian";

function createMockApp(files: Map<string, string> = new Map()): App {
  const app = new App();
  const vaultFiles: TFile[] = [];

  app.vault.getAbstractFileByPath = jest.fn().mockImplementation((path: string) => {
    const file = vaultFiles.find((f) => f.path === path);
    return file ?? null;
  });

  app.vault.getMarkdownFiles = jest.fn().mockReturnValue(vaultFiles);

  app.vault.cachedRead = jest.fn().mockImplementation((file: TFile) => {
    return Promise.resolve(files.get(file.path) ?? "");
  });

  app.vault.create = jest.fn().mockImplementation((path: string, content: string) => {
    const file = new TFile();
    file.path = path;
    file.basename = path.replace(/^.*\//, "").replace(/\.md$/, "");
    vaultFiles.push(file);
    files.set(path, content);
    return Promise.resolve(file);
  });

  app.vault.modify = jest.fn().mockImplementation((file: TFile, content: string) => {
    files.set(file.path, content);
    return Promise.resolve();
  });

  app.vault.delete = jest.fn().mockImplementation((file: TFile) => {
    const idx = vaultFiles.findIndex((f) => f.path === file.path);
    if (idx >= 0) vaultFiles.splice(idx, 1);
    files.delete(file.path);
    return Promise.resolve();
  });

  app.vault.createFolder = jest.fn().mockResolvedValue(undefined);

  return app;
}

describe("SessionManager", () => {
  it("saves and loads a session", async () => {
    const files = new Map<string, string>();
    const app = createMockApp(files);
    const manager = new SessionManager(app);

    await manager.saveSession({
      id: "sess-1",
      title: "Test Session",
      messages: [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there" },
      ],
      createdAt: 1234567890,
      updatedAt: 1234567891,
      model: "claude-test",
      provider: "anthropic",
    });

    const loaded = await manager.loadSession("sess-1");
    expect(loaded).not.toBeNull();
    expect(loaded?.title).toBe("Test Session");
    expect(loaded?.messages).toHaveLength(2);
    expect(loaded?.messages[0].role).toBe("user");
    expect(loaded?.messages[0].content).toBe("Hello");
    expect(loaded?.model).toBe("claude-test");
  });

  it("lists sessions sorted by updatedAt desc", async () => {
    const files = new Map<string, string>();
    const app = createMockApp(files);
    const manager = new SessionManager(app);

    await manager.saveSession({
      id: "old",
      title: "Old",
      messages: [],
      createdAt: 1000,
      updatedAt: 1000,
    });
    await manager.saveSession({
      id: "new",
      title: "New",
      messages: [],
      createdAt: 2000,
      updatedAt: 2000,
    });

    const list = await manager.listSessions();
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe("new");
    expect(list[1].id).toBe("old");
  });

  it("deletes a session", async () => {
    const files = new Map<string, string>();
    const app = createMockApp(files);
    const manager = new SessionManager(app);

    await manager.saveSession({
      id: "to-delete",
      title: "Delete Me",
      messages: [],
      createdAt: 1,
      updatedAt: 1,
    });

    expect(await manager.loadSession("to-delete")).not.toBeNull();
    await manager.deleteSession("to-delete");
    expect(await manager.loadSession("to-delete")).toBeNull();
  });

  it("modifies existing session file on save", async () => {
    const files = new Map<string, string>();
    const app = createMockApp(files);
    const manager = new SessionManager(app);

    await manager.saveSession({
      id: "sess-2",
      title: "Original",
      messages: [{ role: "user", content: "Hello" }],
      createdAt: 1000,
      updatedAt: 1000,
    });

    await manager.saveSession({
      id: "sess-2",
      title: "Updated",
      messages: [{ role: "user", content: "Hello" }],
      createdAt: 1000,
      updatedAt: 2000,
    });

    const loaded = await manager.loadSession("sess-2");
    expect(loaded?.title).toBe("Updated");
    expect(loaded?.updatedAt).toBe(2000);
    expect(files.size).toBe(1);
  });

  it("returns null for non-existent session", async () => {
    const app = createMockApp(new Map());
    const manager = new SessionManager(app);
    const result = await manager.loadSession("missing");
    expect(result).toBeNull();
  });

  it("handles sessions with system and tool messages", async () => {
    const files = new Map<string, string>();
    const app = createMockApp(files);
    const manager = new SessionManager(app);

    await manager.saveSession({
      id: "mixed",
      title: "Mixed",
      messages: [
        { role: "system", content: "You are helpful" },
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi" },
        { role: "tool", content: "Result" },
      ],
      createdAt: 1,
      updatedAt: 1,
    });

    const loaded = await manager.loadSession("mixed");
    expect(loaded?.messages).toHaveLength(4);
    expect(loaded?.messages[0].role).toBe("system");
    expect(loaded?.messages[3].role).toBe("tool");
  });

  it("handles missing frontmatter fields", async () => {
    const files = new Map<string, string>();
    const app = createMockApp(files);
    const manager = new SessionManager(app);

    const file = new TFile();
    file.path = "goliath-sessions/minimal.md";
    file.basename = "minimal";
    const vaultFiles = app.vault.getMarkdownFiles() as TFile[];
    vaultFiles.push(file);
    files.set(file.path, "---\n---\n\n## User\n\nHello\n");

    const loaded = await manager.loadSession("minimal");
    expect(loaded).not.toBeNull();
    expect(loaded?.title).toBe("Untitled Session");
    expect(loaded?.createdAt).toBe(0);
    expect(loaded?.updatedAt).toBe(0);
  });

  it("ignores malformed message sections", async () => {
    const files = new Map<string, string>();
    const app = createMockApp(files);
    const manager = new SessionManager(app);

    const file = new TFile();
    file.path = "goliath-sessions/bad.md";
    file.basename = "bad";
    const vaultFiles = app.vault.getMarkdownFiles() as TFile[];
    vaultFiles.push(file);
    files.set(
      file.path,
      "---\nid: bad\ntitle: Bad\ncreatedAt: 1\nupdatedAt: 1\n---\n\n## UnknownRole\n\nBlah\n\n---\n\n## User\n\nValid\n"
    );

    const loaded = await manager.loadSession("bad");
    expect(loaded).not.toBeNull();
    expect(loaded?.messages).toHaveLength(1);
    expect(loaded?.messages[0].role).toBe("user");
    expect(loaded?.messages[0].content).toBe("Valid");
  });
});
