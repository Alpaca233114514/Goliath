import { createRoot, Root } from "react-dom/client";
import { StrictMode } from "react";
import { ObsidianContext, type ObsidianContextValue } from "./contexts/ObsidianContext";
import ChatApp from "./ChatApp";

// Import CSS as strings (esbuild "text" loader)
import arcoCss from "@arco-design/web-react/dist/css/arco.css";
import themeCss from "./styles/theme.css";

function injectStyles(container: HTMLElement): void {
  const styleId = "goliath-arco-styles";
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = arcoCss + "\n" + themeCss;
  // Append to the Obsidian document head so styles apply within our root
  document.head.appendChild(style);
}

export interface ReactChatRoot {
  root: Root;
  unmount: () => void;
}

export function renderChatApp(
  container: HTMLElement,
  obsidianContext: ObsidianContextValue
): ReactChatRoot {
  injectStyles(container);

  const root = createRoot(container);

  root.render(
    <StrictMode>
      <ObsidianContext.Provider value={obsidianContext}>
        <ChatApp />
      </ObsidianContext.Provider>
    </StrictMode>
  );

  return {
    root,
    unmount: () => {
      root.unmount();
    },
  };
}
