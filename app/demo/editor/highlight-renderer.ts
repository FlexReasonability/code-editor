import { getLanguage, getThemeColors } from "./highlight/registry";
import { tokenize, highlightToHTML, themeToCSSVars } from "./highlight/engine";
import { computeBracketTokens } from "./highlight/brackets";
import type { Token } from "./highlight/types";

export function renderHighlightedHTML(
	text: string,
	languageId?: string,
	caretPos?: number
) {
	const lang = getLanguage(languageId) ?? getLanguage("javascript")!;
	const langTokens = tokenize(text, lang);

	// Calcule les tokens de brackets en ignorant string/comment/regex/jsxText
	const bracketTokens = computeBracketTokens(text, langTokens, caretPos);

	// Évite les collisions: on retire des tokens de langage ceux qui couvrent exactement les brackets
	const bracketPositions = new Set<number>(bracketTokens.map((t) => t.start));
	const filteredLangTokens: Token[] = langTokens.filter((t) => {
		// ne supprime que les tokens d’un seul char qui recouvrent un bracket
		if (t.end - t.start === 1 && bracketPositions.has(t.start)) return false;
		return true;
	});

	const merged = [...filteredLangTokens, ...bracketTokens].sort(
		(a, b) => a.start - b.start || b.end - a.end
	);
	return highlightToHTML(text, merged);
}

export function getHighlightCSSVars(themeId?: string) {
	const colors = getThemeColors(themeId);
	return themeToCSSVars(colors);
}
