import { TFile, TFolder } from "obsidian";
import { ToolDefinition } from "../../api/types";
import { ToolImpl } from "./types";

function getStringArg(args: Record<string, unknown>, key: string): string {
  const value = args[key];
  if (typeof value !== "string") {
    throw new Error(`Argument "${key}" must be a string`);
  }
  return value;
}

function getOptionalStringArg(
  args: Record<string, unknown>,
  key: string
): string | undefined {
  const value = args[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    throw new Error(`Argument "${key}" must be a string`);
  }
  return value;
}

export const readNoteDefinition: ToolDefinition = {
  name: "read_note",
  description:
    "Read the full content of an Obsidian note by its path. Use this when you need to see the content of a specific note.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "The path to the note (e.g. 'Folder/Note.md')",
      },
    },
    required: ["path"],
  },
};

export const readNoteImpl: ToolImpl = async (args, extras) => {
  const path = getStringArg(args, "path");
  const file = extras.app.vault.getAbstractFileByPath(path);

  if (!file) {
    throw new Error(`Note "${path}" not found`);
  }
  if (!(file instanceof TFile)) {
    throw new Error(`"${path}" is not a file`);
  }

  const content = await extras.app.vault.cachedRead(file);
  return content;
};

export const searchVaultDefinition: ToolDefinition = {
  name: "search_vault",
  description:
    "Search the Obsidian vault for notes matching a query. Returns matching note paths and snippets of content.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query string",
      },
    },
    required: ["query"],
  },
};

export const searchVaultImpl: ToolImpl = async (args, extras) => {
  const query = getStringArg(args, "query").toLowerCase();
  const files = extras.app.vault.getMarkdownFiles();
  const results: string[] = [];

  for (const file of files) {
    const content = await extras.app.vault.cachedRead(file);
    if (
      file.path.toLowerCase().includes(query) ||
      content.toLowerCase().includes(query)
    ) {
      const lines = content.split("\n");
      const matchingLines = lines
        .map((line, index) => ({ line, index: index + 1 }))
        .filter(({ line }) => line.toLowerCase().includes(query))
        .slice(0, 3);

      const snippets = matchingLines
        .map(({ line, index }) => `  L${index}: ${line.trim()}`)
        .join("\n");

      results.push(`File: ${file.path}\n${snippets}`);
    }
  }

  if (results.length === 0) {
    return `No notes found matching "${query}"`;
  }

  return results.slice(0, 10).join("\n\n");
};

export const createNoteDefinition: ToolDefinition = {
  name: "create_note",
  description:
    "Create a new Obsidian note at the specified path with the given content.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "The path for the new note (e.g. 'Folder/New Note.md')",
      },
      content: {
        type: "string",
        description: "The content to write to the new note",
      },
    },
    required: ["path", "content"],
  },
};

export const createNoteImpl: ToolImpl = async (args, extras) => {
  const path = getStringArg(args, "path");
  const content = getStringArg(args, "content");

  const existing = extras.app.vault.getAbstractFileByPath(path);
  if (existing) {
    throw new Error(`A file already exists at "${path}"`);
  }

  await extras.app.vault.create(path, content);
  return `Created note at "${path}"`;
};

export const editNoteDefinition: ToolDefinition = {
  name: "edit_note",
  description:
    "Edit an existing Obsidian note. Supports appending content or replacing the entire note.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "The path to the note to edit",
      },
      operation: {
        type: "string",
        description: "Either 'append' or 'replace'",
      },
      content: {
        type: "string",
        description: "The new content to append or replace with",
      },
    },
    required: ["path", "operation", "content"],
  },
};

export const editNoteImpl: ToolImpl = async (args, extras) => {
  const path = getStringArg(args, "path");
  const operation = getStringArg(args, "operation");
  const content = getStringArg(args, "content");

  const file = extras.app.vault.getAbstractFileByPath(path);
  if (!file || !(file instanceof TFile)) {
    throw new Error(`Note "${path}" not found`);
  }

  if (operation === "append") {
    const existing = await extras.app.vault.cachedRead(file);
    await extras.app.vault.modify(file, existing + "\n" + content);
    return `Appended content to "${path}"`;
  } else if (operation === "replace") {
    await extras.app.vault.modify(file, content);
    return `Replaced content of "${path}"`;
  } else {
    throw new Error(`Unknown operation "${operation}". Use "append" or "replace".`);
  }
};

export const listNotesDefinition: ToolDefinition = {
  name: "list_notes",
  description:
    "List all notes in the Obsidian vault, optionally filtered by a folder path.",
  parameters: {
    type: "object",
    properties: {
      folder: {
        type: "string",
        description:
          "Optional folder path to filter by (e.g. 'Projects/'). If omitted, lists all notes.",
      },
    },
    required: [],
  },
};

export const listNotesImpl: ToolImpl = async (args, extras) => {
  const folder = getOptionalStringArg(args, "folder");
  const files = extras.app.vault.getMarkdownFiles();

  const filtered = folder
    ? files.filter((f) => f.path.startsWith(folder))
    : files;

  if (filtered.length === 0) {
    return folder
      ? `No notes found in folder "${folder}"`
      : "No notes found in vault";
  }

  return filtered.map((f) => f.path).join("\n");
};

export const listTagsDefinition: ToolDefinition = {
  name: "list_tags",
  description: "List all tags used across the Obsidian vault.",
  parameters: {
    type: "object",
    properties: {},
    required: [],
  },
};

export const listTagsImpl: ToolImpl = async (_args, extras) => {
  const tags = new Set<string>();
  const files = extras.app.vault.getMarkdownFiles();

  for (const file of files) {
    const cache = extras.app.metadataCache.getFileCache(file);
    if (cache?.tags) {
      for (const tag of cache.tags) {
        tags.add(tag.tag);
      }
    }
    if (cache?.frontmatter?.tags) {
      const frontmatterTags = cache.frontmatter.tags;
      if (Array.isArray(frontmatterTags)) {
        for (const tag of frontmatterTags) {
          if (typeof tag === "string") {
            tags.add(tag.startsWith("#") ? tag : `#${tag}`);
          }
        }
      }
    }
  }

  if (tags.size === 0) {
    return "No tags found in vault";
  }

  return Array.from(tags).sort().join("\n");
};
