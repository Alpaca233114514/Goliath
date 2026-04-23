export class TFile {
  path = "";
  name = "";
  extension = "";
  basename = "";
}

export class TAbstractFile {
  path = "";
}

export class Vault {
  cachedRead = jest.fn().mockResolvedValue("");
}

export class MetadataCache {
  getFileCache = jest.fn().mockReturnValue(null);
  getFirstLinkpathDest = jest.fn().mockReturnValue(null);
}

export interface CachedMetadata {
  frontmatter?: Record<string, unknown>;
  links?: Array<{ link: string; original: string; position: unknown }>;
}

export interface LinkCache {
  link: string;
  original: string;
  position: unknown;
}

export class Plugin {
  app = {};
  loadData = jest.fn().mockResolvedValue({});
  saveData = jest.fn().mockResolvedValue(undefined);
}

export class PluginSettingTab {
  app = {};
  containerEl = document.createElement("div");
  display = jest.fn();
}

export class Setting {
  constructor(public containerEl: HTMLElement) {}
  setName = jest.fn().mockReturnThis();
  setDesc = jest.fn().mockReturnThis();
  addText = jest.fn().mockReturnThis();
  addTextArea = jest.fn().mockReturnThis();
  addDropdown = jest.fn().mockReturnThis();
  addToggle = jest.fn().mockReturnThis();
  addSlider = jest.fn().mockReturnThis();
}

export class Modal {
  app = {};
  contentEl = document.createElement("div");
  open = jest.fn();
  close = jest.fn();
}

export class Notice {
  constructor(public message: string) {}
}

export class WorkspaceLeaf {
  view = {};
}

export class ItemView {
  containerEl = document.createElement("div");
}

export class App {
  vault = new Vault();
  metadataCache = new MetadataCache();
  workspace = {
    getActiveFile: jest.fn().mockReturnValue(null),
    getLeavesOfType: jest.fn().mockReturnValue([]),
    getRightLeaf: jest.fn().mockReturnValue(new WorkspaceLeaf()),
    revealLeaf: jest.fn(),
    detachLeavesOfType: jest.fn(),
  };
}

export function addIcon(name: string, svg: string): void {}
