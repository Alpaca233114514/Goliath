import { ToolRegistry } from "./registry";
import {
  readNoteDefinition,
  readNoteImpl,
  searchVaultDefinition,
  searchVaultImpl,
  createNoteDefinition,
  createNoteImpl,
  editNoteDefinition,
  editNoteImpl,
  listNotesDefinition,
  listNotesImpl,
  listTagsDefinition,
  listTagsImpl,
} from "./obsidian-tools";

export function createDefaultToolRegistry(): ToolRegistry {
  const registry = new ToolRegistry();
  registry.register(readNoteDefinition, readNoteImpl);
  registry.register(searchVaultDefinition, searchVaultImpl);
  registry.register(createNoteDefinition, createNoteImpl);
  registry.register(editNoteDefinition, editNoteImpl);
  registry.register(listNotesDefinition, listNotesImpl);
  registry.register(listTagsDefinition, listTagsImpl);
  return registry;
}

export { ToolRegistry } from "./registry";
export type { ToolExtras, ToolImpl, RegisteredTool } from "./types";
