import { Translations } from "./types";
import { en } from "./en";
import { zh } from "./zh";

export type Language = "en" | "zh";

const translations: Record<Language, Translations> = { en, zh };

let currentLanguage: Language = "en";

export function setLanguage(lang: Language): void {
  currentLanguage = lang;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(): Translations {
  return translations[currentLanguage];
}

export function formatTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{(\w+)\}/g, (_match, key) => vars[key] ?? key);
}
