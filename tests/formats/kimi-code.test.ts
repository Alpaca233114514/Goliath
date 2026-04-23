import { generateKimiCodeFormat } from "../../src/formats/kimi-code";
import { FileContext } from "../../src/api/types";

describe("generateKimiCodeFormat", () => {
  const contexts: FileContext[] = [
    { path: "notes/hello.md", content: "# Hello\nWorld" },
    { path: "src/main.ts", content: "console.log('hello');" },
  ];

  it("formats files with markdown headers", () => {
    const result = generateKimiCodeFormat(contexts, {
      includeFrontmatter: false,
    });

    expect(result.format).toBe("kimi-code");
    expect(result.content).toContain("## File: notes/hello.md");
    expect(result.content).toContain("```\n# Hello\nWorld\n```");
    expect(result.content).toContain("## File: src/main.ts");
    expect(result.content).toContain("```\nconsole.log('hello');\n```");
  });

  it("includes system prompt when provided", () => {
    const result = generateKimiCodeFormat(contexts, {
      includeFrontmatter: false,
      systemPrompt: "You are a helpful assistant",
    });

    expect(result.content).toContain("# System\nYou are a helpful assistant");
  });

  it("includes user query when provided", () => {
    const result = generateKimiCodeFormat(contexts, {
      includeFrontmatter: false,
      userQuery: "What does this code do?",
    });

    expect(result.content).toContain("## Question\nWhat does this code do?");
  });
});
