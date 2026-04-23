import { generateKimiStreamJsonFormat } from "../../src/formats/kimi-stream-json";
import { FileContext } from "../../src/api/types";

describe("generateKimiStreamJsonFormat", () => {
  const contexts: FileContext[] = [
    { path: "notes/hello.md", content: "# Hello\n\nWorld" },
    { path: "notes/code.ts", content: "const x = 1;" },
  ];

  it("should generate stream-json with system prompt", () => {
    const result = generateKimiStreamJsonFormat(contexts, {
      includeFrontmatter: false,
      systemPrompt: "You are a helpful assistant.",
    });

    const parsed = JSON.parse(result.content);
    expect(parsed.role).toBe("user");
    expect(parsed.content).toContain("You are a helpful assistant.");
    expect(parsed.content).toContain("File: notes/hello.md");
    expect(parsed.content).toContain("File: notes/code.ts");
  });

  it("should generate stream-json without system prompt", () => {
    const result = generateKimiStreamJsonFormat(contexts, {
      includeFrontmatter: false,
    });

    const parsed = JSON.parse(result.content);
    expect(parsed.role).toBe("user");
    expect(parsed.content).not.toContain("System:");
    expect(parsed.content).toContain("File: notes/hello.md");
  });

  it("should include user query when provided", () => {
    const result = generateKimiStreamJsonFormat(contexts, {
      includeFrontmatter: false,
      systemPrompt: "Assist me.",
      userQuery: "What is this about?",
    });

    const parsed = JSON.parse(result.content);
    expect(parsed.content).toContain("Assist me.");
    expect(parsed.content).toContain("What is this about?");
  });

  it("should include file extension in code blocks", () => {
    const result = generateKimiStreamJsonFormat(contexts, {
      includeFrontmatter: false,
    });

    const parsed = JSON.parse(result.content);
    expect(parsed.content).toContain("```md");
    expect(parsed.content).toContain("```ts");
  });

  it("should handle empty contexts", () => {
    const result = generateKimiStreamJsonFormat([], {
      includeFrontmatter: false,
      systemPrompt: "Just chat.",
    });

    const parsed = JSON.parse(result.content);
    expect(parsed.role).toBe("user");
    expect(parsed.content).toBe("Just chat.");
  });

  it("should handle user query without system prompt", () => {
    const result = generateKimiStreamJsonFormat(contexts, {
      includeFrontmatter: false,
      userQuery: "What is this?",
    });

    const parsed = JSON.parse(result.content);
    expect(parsed.content).not.toContain("System:");
    expect(parsed.content).toContain("What is this?");
  });

  it("should handle files without extension", () => {
    const result = generateKimiStreamJsonFormat(
      [{ path: "", content: "no ext" }],
      { includeFrontmatter: false }
    );

    const parsed = JSON.parse(result.content);
    expect(parsed.content).toContain("```\nno ext");
    expect(parsed.content).not.toMatch(/```\w/);
  });
});
