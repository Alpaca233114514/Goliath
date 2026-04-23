import { generateOaiChatFormat } from "../../src/formats/oai-chat";
import { FileContext } from "../../src/api/types";

describe("generateOaiChatFormat", () => {
  const contexts: FileContext[] = [
    { path: "notes/hello.md", content: "# Hello\nWorld" },
  ];

  it("generates valid Chat Completions JSON", () => {
    const result = generateOaiChatFormat(contexts, {
      includeFrontmatter: false,
    });

    expect(result.format).toBe("oai-chat");
    const parsed = JSON.parse(result.content);
    expect(parsed.messages).toHaveLength(1);
    expect(parsed.messages[0].role).toBe("user");
    expect(parsed.messages[0].content).toContain("File: notes/hello.md");
  });

  it("includes system message when provided", () => {
    const result = generateOaiChatFormat(contexts, {
      includeFrontmatter: false,
      systemPrompt: "You are helpful",
    });

    const parsed = JSON.parse(result.content);
    expect(parsed.messages).toHaveLength(2);
    expect(parsed.messages[0].role).toBe("system");
    expect(parsed.messages[0].content).toBe("You are helpful");
  });

  it("includes user query after context", () => {
    const result = generateOaiChatFormat(contexts, {
      includeFrontmatter: false,
      userQuery: "Explain this",
    });

    const parsed = JSON.parse(result.content);
    expect(parsed.messages[0].content).toContain("Explain this");
  });

  it("exposes metadata as array", () => {
    const result = generateOaiChatFormat(contexts, {
      includeFrontmatter: false,
      systemPrompt: "system",
      userQuery: "question",
    });

    expect(result.metadata).toBeDefined();
    expect(result.metadata?.messages).toHaveLength(2);
  });
});
