import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const PLUGIN_DIR = path.resolve(__dirname, "../../");

interface Manifest {
  id: string;
  name: string;
  version: string;
  minAppVersion: string;
  description: string;
  author: string;
  isDesktopOnly: boolean;
}

test.describe("Goliath plugin smoke tests", () => {
  test("manifest.json is valid", () => {
    const manifestPath = path.join(PLUGIN_DIR, "manifest.json");
    expect(fs.existsSync(manifestPath)).toBe(true);

    const content = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(content) as Manifest;

    expect(manifest.id).toBeDefined();
    expect(manifest.name).toBeDefined();
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.minAppVersion).toBeDefined();
  });

  test("main.js build artifact exists and is not empty", () => {
    const mainPath = path.join(PLUGIN_DIR, "main.js");
    expect(fs.existsSync(mainPath)).toBe(true);

    const stats = fs.statSync(mainPath);
    expect(stats.size).toBeGreaterThan(1000);
  });

  test("main.js contains expected exports", () => {
    const mainPath = path.join(PLUGIN_DIR, "main.js");
    const content = fs.readFileSync(mainPath, "utf-8");

    expect(content).toContain("GoliathPlugin");
    expect(content).toContain("goliath-chat-view");
  });

  test("backend modules are included in build", () => {
    const mainPath = path.join(PLUGIN_DIR, "main.js");
    const content = fs.readFileSync(mainPath, "utf-8");

    expect(content).toContain("ChatCore");
    expect(content).toContain("ToolRegistry");
    expect(content).toContain("SessionManager");
  });

  test("tool definitions are bundled", () => {
    const mainPath = path.join(PLUGIN_DIR, "main.js");
    const content = fs.readFileSync(mainPath, "utf-8");

    expect(content).toContain("read_note");
    expect(content).toContain("search_vault");
    expect(content).toContain("create_note");
    expect(content).toContain("edit_note");
  });
});
