import { createContext, useContext } from "react";
import { App, ItemView } from "obsidian";
import type GoliathPlugin from "../../main";

export interface ObsidianContextValue {
  app: App;
  plugin: GoliathPlugin;
  view: ItemView;
}

export const ObsidianContext = createContext<ObsidianContextValue | null>(null);

export function useObsidian(): ObsidianContextValue {
  const ctx = useContext(ObsidianContext);
  if (!ctx) {
    throw new Error("useObsidian must be used within an ObsidianContext.Provider");
  }
  return ctx;
}
