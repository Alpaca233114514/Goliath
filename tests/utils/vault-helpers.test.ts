import {
  readFileContent,
  getFrontmatter,
  buildFileContext,
  getLinkedFiles,
  buildContextWithLinked,
} from "../../src/utils/vault-helpers";
import { Vault, MetadataCache, TFile, CachedMetadata } from "obsidian";

describe("vault-helpers", () => {
  const mockFile = {
    path: "test.md",
    name: "test.md",
    extension: "md",
    basename: "test",
  } as TFile;

  const mockVault = {
    cachedRead: jest.fn().mockResolvedValue("# Test\nContent"),
  } as unknown as Vault;

  const mockCache = {
    getFileCache: jest.fn().mockReturnValue({
      frontmatter: { tags: ["test"] },
      links: [{ link: "other", original: "other", position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } } }],
    } as unknown as CachedMetadata),
    getFirstLinkpathDest: jest.fn().mockImplementation((linkpath: string) => {
      if (linkpath === "other") {
        const f = Object.create((TFile as any).prototype ?? {});
        f.path = "other.md";
        f.name = "other.md";
        f.extension = "md";
        f.basename = "other";
        return f;
      }
      return null;
    }),
  } as unknown as MetadataCache;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reads file content", async () => {
    const content = await readFileContent(mockVault, mockFile);
    expect(content).toBe("# Test\nContent");
    expect(mockVault.cachedRead).toHaveBeenCalledWith(mockFile);
  });

  it("gets frontmatter from cache", () => {
    const frontmatter = getFrontmatter(mockCache, mockFile);
    expect(frontmatter).toEqual({ tags: ["test"] });
  });

  it("returns undefined when no frontmatter", () => {
    (mockCache.getFileCache as jest.Mock).mockReturnValueOnce({});
    const frontmatter = getFrontmatter(mockCache, mockFile);
    expect(frontmatter).toBeUndefined();
  });

  it("builds file context", async () => {
    const context = await buildFileContext(mockVault, mockCache, mockFile, true);
    expect(context.path).toBe("test.md");
    expect(context.content).toBe("# Test\nContent");
    expect(context.frontmatter).toEqual({ tags: ["test"] });
  });

  it("excludes frontmatter when flag is false", async () => {
    const context = await buildFileContext(mockVault, mockCache, mockFile, false);
    expect(context.frontmatter).toBeUndefined();
  });

  it("gets linked files", () => {
    const linked = getLinkedFiles(mockCache, mockFile, mockVault, 1);
    expect(linked).toHaveLength(1);
    expect(linked[0].path).toBe("other.md");
  });

  it("uses default depth of 1", () => {
    const linked = getLinkedFiles(mockCache, mockFile, mockVault);
    expect(linked).toHaveLength(1);
    expect(linked[0].path).toBe("other.md");
  });

  it("returns empty links when cache is missing", () => {
    const emptyCache = {
      getFileCache: jest.fn().mockReturnValue(null),
      getFirstLinkpathDest: jest.fn().mockReturnValue(null),
    } as unknown as MetadataCache;

    const linked = getLinkedFiles(emptyCache, mockFile, mockVault, 1);
    expect(linked).toHaveLength(0);
  });

  it("respects depth limit", () => {
    const linked = getLinkedFiles(mockCache, mockFile, mockVault, 0);
    expect(linked).toHaveLength(0);
  });

  it("follows nested links when depth > 1", () => {
    const deepCache = {
      getFileCache: jest.fn().mockImplementation((file: TFile) => {
        if (file.path === "test.md") {
          return {
            links: [{ link: "other", original: "other", position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } } }],
          };
        }
        if (file.path === "other.md") {
          return {
            links: [{ link: "deep", original: "deep", position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } } }],
          };
        }
        return { links: [] };
      }),
      getFirstLinkpathDest: jest.fn().mockImplementation((linkpath: string, sourcePath: string) => {
        if (linkpath === "other" && sourcePath === "test.md") {
          const f = Object.create((TFile as any).prototype ?? {});
          f.path = "other.md";
          f.name = "other.md";
          f.extension = "md";
          f.basename = "other";
          return f;
        }
        if (linkpath === "deep" && sourcePath === "other.md") {
          const f = Object.create((TFile as any).prototype ?? {});
          f.path = "deep.md";
          f.name = "deep.md";
          f.extension = "md";
          f.basename = "deep";
          return f;
        }
        return null;
      }),
    } as unknown as MetadataCache;

    const linked = getLinkedFiles(deepCache, mockFile, mockVault, 2);
    expect(linked).toHaveLength(2);
    expect(linked.map((f) => f.path)).toContain("other.md");
    expect(linked.map((f) => f.path)).toContain("deep.md");
  });

  it("skips self-referencing links", () => {
    const selfCache = {
      getFileCache: jest.fn().mockReturnValue({
        links: [{ link: "test", original: "test", position: { start: { line: 0, col: 0, offset: 0 }, end: { line: 0, col: 0, offset: 0 } } }],
      }),
      getFirstLinkpathDest: jest.fn().mockImplementation(() => {
        const f = Object.create((TFile as any).prototype ?? {});
        f.path = "test.md";
        f.name = "test.md";
        f.extension = "md";
        f.basename = "test";
        return f;
      }),
    } as unknown as MetadataCache;

    const contexts = buildContextWithLinked(mockVault, selfCache, mockFile, true, true, 1);
    return expect(contexts).resolves.toHaveLength(1);
  });

  it("builds context with linked notes", async () => {
    const contexts = await buildContextWithLinked(
      mockVault,
      mockCache,
      mockFile,
      true,
      true,
      1
    );

    expect(contexts).toHaveLength(2);
    expect(contexts[0].path).toBe("test.md");
    expect(contexts[1].path).toBe("other.md");
  });

  it("skips linked notes when disabled", async () => {
    const contexts = await buildContextWithLinked(
      mockVault,
      mockCache,
      mockFile,
      true,
      false,
      1
    );

    expect(contexts).toHaveLength(1);
    expect(contexts[0].path).toBe("test.md");
  });
});
