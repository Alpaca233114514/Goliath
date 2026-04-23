import { App } from "obsidian";
import { ToolDefinition } from "../../api/types";

export interface ToolExtras {
  app: App;
}

export type ToolImpl = (
  args: Record<string, unknown>,
  extras: ToolExtras
) => Promise<string>;

export interface RegisteredTool {
  definition: ToolDefinition;
  implementation: ToolImpl;
}
