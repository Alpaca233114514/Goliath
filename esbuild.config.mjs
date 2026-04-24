import esbuild from "esbuild";
import process from "process";
import fs from "fs";

const prod = process.argv[2] === "production";

const context = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: [
    "obsidian",
    "electron",
    "@codemirror/*",
    "moment",
    "crypto"
  ],
  format: "cjs",
  target: "es2022",
  outfile: "main.js",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  platform: "browser",
  jsx: "automatic",
  loader: {
    ".css": "text",
  },
});

if (prod) {
  await context.rebuild();
  // Remove the separate CSS file since we inline styles via JS
  try {
    fs.unlinkSync("main.css");
  } catch {
    // ignore if file does not exist
  }
  process.exit(0);
} else {
  await context.watch();
}
