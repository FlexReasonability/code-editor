// src/highlight-renderer.ts
// Fusionne langage + brackets + chevrons JSX, puis APLATIT (pas de chevauchements)
import { getLanguage, getThemeColors } from "./highlight/registry";
import { tokenize, highlightToHTML, themeToCSSVars } from "./highlight/engine";
import { computeBracketTokens } from "./highlight/brackets";
import { computeJsxAngleTokens } from "./highlight/jsx-angles";
import { tokenPriority } from "./highlight/priority";
import type { Token } from "./highlight/types";

function flattenTokens(text: string, tokens: Token[]): Token[] {
	const N = text.length;
	const coverType = new Array<Token["type"] | null>(N).fill(null);
	const coverPrio = new Array<number>(N).fill(-1);

	for (const t of tokens) {
		const pr = t.prio ?? tokenPriority(t.type);
		const a = Math.max(0, Math.min(N, t.start));
		const b = Math.max(0, Math.min(N, t.end));
		for (let i = a; i < b; i++) {
			if (pr >= coverPrio[i]) {
				coverPrio[i] = pr;
				coverType[i] = t.type;
			}
		}
	}

	const out: Token[] = [];
	let i = 0;
	while (i < N) {
		const tt = coverType[i];
		if (tt == null) {
			i++;
			continue;
		}
		const pr = coverPrio[i];
		let j = i + 1;
		while (j < N && coverType[j] === tt) j++;
		out.push({ start: i, end: j, type: tt, prio: pr });
		i = j;
	}
	return out;
}

export function renderHighlightedHTML(
	text: string,
	languageId?: string,
	caretPos?: number
) {
	const lang = getLanguage(languageId) ?? getLanguage("javascript")!;
	const langTokens = tokenize(text, lang);

	const bracketTokens = computeBracketTokens(text, langTokens, caretPos);
	const jsxAngleTokens = computeJsxAngleTokens(text);

	// Aplatit avec priorité -> évite les doublons et garantit que jsxBracket grise bien < > </ />
	const all = flattenTokens(text, [
		...langTokens,
		...bracketTokens,
		...jsxAngleTokens,
	]);
	return highlightToHTML(text, all);
}

export function getHighlightCSSVars(themeId?: string) {
	const colors = getThemeColors(themeId);
	return themeToCSSVars(colors);
}
