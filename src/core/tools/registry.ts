import { ToolDefinition, ToolResult } from "../../api/types";
import { RegisteredTool, ToolExtras, ToolImpl } from "./types";

export class ToolRegistry {
  private tools = new Map<string, RegisteredTool>();

  register(definition: ToolDefinition, implementation: ToolImpl): void {
    this.tools.set(definition.name, { definition, implementation });
  }

  getDefinitions(): ToolDefinition[] {
    return Array.from(this.tools.values()).map((t) => t.definition);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  async execute(
    name: string,
    args: Record<string, unknown>,
    extras: ToolExtras,
    toolCallId: string
  ): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        toolCallId,
        name,
        content: `Tool "${name}" not found`,
        isError: true,
      };
    }

    try {
      const content = await tool.implementation(args, extras);
      return { toolCallId, name, content };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Goliath] Tool "${name}" execution error:`, message);
      return { toolCallId, name, content: message, isError: true };
    }
  }
}
