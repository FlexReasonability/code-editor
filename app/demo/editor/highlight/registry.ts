// src/highlight/registry.ts
import type { Language, ThemeColors } from "./types";

const languageRegistry = new Map<string, Language>();
const themeRegistry = new Map<string, ThemeColors>();

export function registerLanguage(lang: Language) {
	languageRegistry.set(lang.id, lang);
}

export function getLanguage(id?: string): Language | undefined {
	if (!id) return undefined;
	return languageRegistry.get(id.toLowerCase());
}

export function registerTheme(id: string, theme: ThemeColors) {
	themeRegistry.set(id, theme);
}

export function getThemeColors(id?: string): ThemeColors {
	if (!id) return {};
	return themeRegistry.get(id) ?? {};
}

export function listLanguages() {
	return Array.from(languageRegistry.keys());
}

export function listThemes() {
	return Array.from(themeRegistry.keys());
}
