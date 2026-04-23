import { generateClaudeCodeFormat } from "../../src/formats/claude-code";
import { FileContext } from "../../src/api/types";

describe("generateClaudeCodeFormat", () => {
  const contexts: FileContext[] = [
    { path: "notes/hello.md", content: "# Hello\nWorld" },
    { path: "src/main.ts", content: "console.log('hello');" },
  ];

  it("formats files with XML tags", () => {
    const result = generateClaudeCodeFormat(contexts, {
      includeFrontmatter: false,
    });

    expect(result.format).toBe("claude-code");
    expect(result.content).toContain('<file path="notes/hello.md">');
    expect(result.content).toContain("```md\n# Hello\nWorld\n```");
    expect(result.content).toContain('<file path="src/main.ts">');
    expect(result.content).toContain("```ts\nconsole.log('hello');\n```");
  });

  it("includes system prompt when provided", () => {
    const result = generateClaudeCodeFormat(contexts, {
      includeFrontmatter: false,
      systemPrompt: "You are a helpful assistant",
    });

    expect(result.content).toContain("<system>You are a helpful assistant</system>");
  });

  it("includes user query when provided", () => {
    const result = generateClaudeCodeFormat(contexts, {
      includeFrontmatter: false,
      userQuery: "What does this code do?",
    });

    expect(result.content).toContain("<question>\nWhat does this code do?\n</question>");
  });

  it("handles empty contexts", () => {
    const result = generateClaudeCodeFormat([], {
      includeFrontmatter: false,
      systemPrompt: "test",
      userQuery: "question",
    });

    expect(result.content).toContain("<system>test</system>");
    expect(result.content).toContain("<question>\nquestion\n</question>");
    expect(result.content).not.toContain("<file");
  });

  it("handles files without extension", () => {
    const result = generateClaudeCodeFormat(
      [{ path: "Makefile", content: "all:" }],
      { includeFrontmatter: false }
    );

    expect(result.content).toContain('<file path="Makefile">');
    expect(result.content).toContain("```Makefile\nall:\n```");
  });

  it("handles empty extension path", () => {
    const result = generateClaudeCodeFormat(
      [{ path: "", content: "no ext" }],
      { includeFrontmatter: false }
    );

    expect(result.content).toContain('<file path="">');
    expect(result.content).toContain("```\nno ext\n```");
  });
});
