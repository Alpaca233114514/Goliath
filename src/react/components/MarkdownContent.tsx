import { useEffect, useRef } from "react";
import { MarkdownRenderer } from "obsidian";
import { useObsidian } from "../contexts/ObsidianContext";

interface MarkdownContentProps {
  markdown: string;
  isError?: boolean;
}

export function MarkdownContent({ markdown, isError }: MarkdownContentProps) {
  const { view } = useObsidian();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const render = async () => {
      el.empty();
      try {
        await MarkdownRenderer.renderMarkdown(markdown, el, "", view);
        enhanceCodeBlocks(el);
      } catch (error) {
        console.error("[Goliath] Markdown render error:", error);
        el.textContent = markdown;
      }
    };

    render();
  }, [markdown, view]);

  return (
    <div
      ref={containerRef}
      className="markdown-rendered"
      style={{
        fontSize: 14,
        lineHeight: 1.5,
        color: isError ? "var(--text-error)" : "inherit",
      }}
    />
  );
}

function enhanceCodeBlocks(container: HTMLElement): void {
  const preElements = container.querySelectorAll("pre");
  preElements.forEach((pre) => {
    if (pre.querySelector(".goliath-code-copy-btn")) return;

    const copyBtn = document.createElement("button");
    copyBtn.className = "goliath-code-copy-btn";
    copyBtn.textContent = "Copy";
    copyBtn.style.position = "absolute";
    copyBtn.style.top = "4px";
    copyBtn.style.right = "4px";
    copyBtn.style.padding = "2px 8px";
    copyBtn.style.fontSize = "10px";
    copyBtn.style.borderRadius = "4px";
    copyBtn.style.backgroundColor = "var(--background-primary)";
    copyBtn.style.color = "var(--text-normal)";
    copyBtn.style.border = "1px solid var(--background-modifier-border)";
    copyBtn.style.cursor = "pointer";
    copyBtn.style.opacity = "0";
    copyBtn.style.transition = "opacity 0.2s";

    const codeEl = pre.querySelector("code");
    copyBtn.addEventListener("click", () => {
      if (codeEl) {
        navigator.clipboard.writeText(codeEl.textContent || "");
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = "Copy";
        }, 2000);
      }
    });

    pre.addEventListener("mouseenter", () => {
      copyBtn.style.opacity = "1";
    });
    pre.addEventListener("mouseleave", () => {
      copyBtn.style.opacity = "0";
    });

    pre.style.position = "relative";
    pre.appendChild(copyBtn);
  });
}
