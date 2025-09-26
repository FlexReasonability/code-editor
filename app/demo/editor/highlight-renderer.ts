// src/editor/highlightRenderer.ts
import { getLanguage, getThemeColors } from "./highlight/registry";
import { tokenize, highlightToHTML, themeToCSSVars } from "./highlight/engine";

export function renderHighlightedHTML(text: string, languageId?: string) {
	const lang = getLanguage(languageId) ?? getLanguage("javascript")!;
	const tokens = tokenize(text, lang);
	return highlightToHTML(text, tokens);
}

export function getHighlightCSSVars(themeId?: string) {
	const colors = getThemeColors(themeId);
	return themeToCSSVars(colors);
}
