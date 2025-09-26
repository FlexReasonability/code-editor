// src/highlight/engine.ts
import type { Language, Rule, Token, TokenType, ThemeColors } from "./types";

/** Échappe le texte pour l’injecter dans innerHTML */
function escapeHTML(s: string) {
	return s
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
}

/** Tokenize en respectant l’ordre/priority et en évitant les chevauchements */
export function tokenize(text: string, language: Language): Token[] {
	const rules = [...language.rules].sort(
		(a, b) => (a.priority ?? 0) - (b.priority ?? 0)
	);
	const taken: [number, number, TokenType][] = []; // ranges réservés
	const tokens: Token[] = [];

	const overlaps = (start: number, end: number) =>
		taken.some(([s, e]) => !(end <= s || start >= e));

	for (const rule of rules) {
		const re = new RegExp(
			rule.pattern.source,
			rule.pattern.flags.includes("g")
				? rule.pattern.flags
				: rule.pattern.flags + "g"
		);
		let m: RegExpExecArray | null;
		while ((m = re.exec(text))) {
			const start = m.index;
			const end = start + m[0].length;
			if (start === end) continue;
			if (overlaps(start, end)) continue;
			tokens.push({ start, end, type: rule.type });
			taken.push([start, end, rule.type]);
		}
	}

	tokens.sort((a, b) => a.start - b.start || b.end - a.end);
	return tokens;
}

/** Transforme tokens en HTML avec <span class="tok-..."> */
export function highlightToHTML(text: string, tokens: Token[]): string {
	let out = "";
	let pos = 0;
	for (const t of tokens) {
		if (t.start > pos) out += escapeHTML(text.slice(pos, t.start));
		const chunk = escapeHTML(text.slice(t.start, t.end));
		out += `<span class="tok ${"tok-" + t.type}">${chunk}</span>`;
		pos = t.end;
	}
	if (pos < text.length) out += escapeHTML(text.slice(pos));
	return out;
}

/** Convertit un ThemeColors en variables CSS inline */
export function themeToCSSVars(theme: ThemeColors): Record<string, string> {
	const vars: Record<string, string> = {};
	for (const [k, v] of Object.entries(theme)) {
		vars[`--tok-${k}`] = v!;
	}
	return vars;
}
