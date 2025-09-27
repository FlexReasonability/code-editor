// src/highlight/jsx-angles.ts — fixe une priorité plus haute que les variables/opérateurs
import type { Token } from "./types";

export function computeJsxAngleTokens(text: string): Token[] {
	const tokens: Token[] = [];
	const isIdent = (c: string) => /[A-Za-z0-9_$]/.test(c);
	const nextIsTagLetter = (i: number) => {
		const n1 = text[i + 1];
		if (n1 === "/") return /[A-Za-z]/.test(text[i + 2] || "");
		return /[A-Za-z]/.test(n1 || "");
	};
	const prevNonSpace = (i: number) => {
		let k = i - 1;
		while (k >= 0 && /\s/.test(text[k])) k--;
		return k;
	};

	let i = 0;
	while (i < text.length) {
		if (text[i] === "<" && nextIsTagLetter(i)) {
			const p = prevNonSpace(i);
			if (p < 0 || (!isIdent(text[p]) && text[p] !== ")")) {
				// < ou </
				if (text[i + 1] === "/")
					tokens.push({ start: i, end: i + 2, type: "jsxBracket", prio: 95 }),
						(i += 2);
				else
					tokens.push({ start: i, end: i + 1, type: "jsxBracket", prio: 95 }),
						(i += 1);

				// avance jusqu'au '>' hors quotes et hors {}
				let j = i,
					quote: null | "'" | '"' = null,
					brace = 0;
				while (j < text.length) {
					const ch = text[j];
					if (quote) {
						if (ch === quote && text[j - 1] !== "\\") quote = null;
					} else {
						if (ch === "{") brace++;
						else if (ch === "}") brace = Math.max(0, brace - 1);
						else if (ch === "'" || ch === '"') quote = ch;
						else if (ch === ">" && brace === 0) {
							if (text[j - 1] === "/")
								tokens.push({
									start: j - 1,
									end: j + 1,
									type: "jsxBracket",
									prio: 95,
								});
							else
								tokens.push({
									start: j,
									end: j + 1,
									type: "jsxBracket",
									prio: 95,
								});
							i = j + 1;
							break;
						}
					}
					j++;
				}
				continue;
			}
		}
		i++;
	}
	return tokens;
}
