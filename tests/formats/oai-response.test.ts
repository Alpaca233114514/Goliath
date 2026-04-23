import { generateOaiResponseFormat } from "../../src/formats/oai-response";
import { FileContext } from "../../src/api/types";

describe("generateOaiResponseFormat", () => {
  const contexts: FileContext[] = [
    { path: "notes/hello.md", content: "# Hello\nWorld" },
  ];

  it("generates valid Response API JSON", () => {
    const result = generateOaiResponseFormat(contexts, {
      includeFrontmatter: false,
    });

    expect(result.format).toBe("oai-response");
    const parsed = JSON.parse(result.content);
    expect(parsed.model).toBe("gpt-4o");
    expect(parsed.input).toBeDefined();
    expect(Array.isArray(parsed.input)).toBe(true);
  });

  it("includes system message when provided", () => {
    const result = generateOaiResponseFormat(contexts, {
      includeFrontmatter: false,
      systemPrompt: "You are helpful",
    });

    const parsed = JSON.parse(result.content);
    const systemItem = parsed.input.find(
      (item: { type: string; role?: string }) =>
        item.type === "message" && item.role === "system"
    );
    expect(systemItem).toBeDefined();
    expect(systemItem.content).toBe("You are helpful");
  });

  it("includes file items for each context", () => {
    const result = generateOaiResponseFormat(contexts, {
      includeFrontmatter: false,
    });

    const parsed = JSON.parse(result.content);
    const fileItems = parsed.input.filter(
      (item: { type: string }) => item.type === "file"
    );
    expect(fileItems).toHaveLength(1);
    expect(fileItems[0].file_path).toBe("notes/hello.md");
    expect(fileItems[0].file_content).toBe("# Hello\nWorld");
  });

  it("includes user message when query provided", () => {
    const result = generateOaiResponseFormat(contexts, {
      includeFrontmatter: false,
      userQuery: "Explain",
    });

    const parsed = JSON.parse(result.content);
    const userItem = parsed.input.find(
      (item: { type: string; role?: string }) =>
        item.type === "message" && item.role === "user"
    );
    expect(userItem).toBeDefined();
    expect(userItem.content).toEqual([
      { type: "input_text", text: "Explain" },
    ]);
  });
});
