import { ToolRegistry } from "../../../src/core/tools/registry";
import { ToolDefinition } from "../../../src/api/types";
import { App } from "obsidian";

const mockApp = new App();

const testToolDef: ToolDefinition = {
  name: "test_tool",
  description: "A test tool",
  parameters: {
    type: "object",
    properties: {
      input: { type: "string" },
    },
    required: ["input"],
  },
};

describe("ToolRegistry", () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  it("registers and lists tools", () => {
    registry.register(testToolDef, async (args) => `Result: ${args.input}`);
    const defs = registry.getDefinitions();
    expect(defs).toHaveLength(1);
    expect(defs[0].name).toBe("test_tool");
  });

  it("checks if a tool exists", () => {
    expect(registry.has("test_tool")).toBe(false);
    registry.register(testToolDef, async () => "done");
    expect(registry.has("test_tool")).toBe(true);
  });

  it("executes a registered tool successfully", async () => {
    registry.register(testToolDef, async (args) => `Echo: ${args.input}`);
    const result = await registry.execute(
      "test_tool",
      { input: "hello" },
      { app: mockApp },
      "call-1"
    );
    expect(result.name).toBe("test_tool");
    expect(result.toolCallId).toBe("call-1");
    expect(result.content).toBe("Echo: hello");
    expect(result.isError).toBeUndefined();
  });

  it("returns error for unknown tool", async () => {
    const result = await registry.execute(
      "missing",
      {},
      { app: mockApp },
      "call-2"
    );
    expect(result.isError).toBe(true);
    expect(result.content).toContain("not found");
  });

  it("catches tool implementation errors", async () => {
    registry.register(testToolDef, async () => {
      throw new Error("boom");
    });
    const result = await registry.execute(
      "test_tool",
      { input: "x" },
      { app: mockApp },
      "call-3"
    );
    expect(result.isError).toBe(true);
    expect(result.content).toBe("boom");
  });

  it("catches non-Error throws", async () => {
    registry.register(testToolDef, async () => {
      throw "string error";
    });
    const result = await registry.execute(
      "test_tool",
      { input: "x" },
      { app: mockApp },
      "call-4"
    );
    expect(result.isError).toBe(true);
    expect(result.content).toBe("string error");
  });
});
