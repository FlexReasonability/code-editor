// src/highlight/jsx-angles.ts
// Détecte UNIQUEMENT les chevrons des balises JSX : "<", "</", ">", "/>"
import type { Token } from "./types";

const isIdent = (c: string) => /[A-Za-z0-9_$]/.test(c);
const isTagStart = (c: string | undefined) => !!c && /[A-Za-z]/.test(c); // tag HTML ou Composant

function prevNonSpace(text: string, i: number) {
	let k = i - 1;
	while (k >= 0 && /\s/.test(text[k])) k--;
	return k;
}

/** Renvoie des tokens `jsxBracket` pour les chevrons qui encadrent des balises JSX. */
export function computeJsxAngleTokens(text: string): Token[] {
	const out: Token[] = [];
	let i = 0;
	const n = text.length;

	while (i < n) {
		if (text[i] === "<") {
			// Heuristique anti-conflit:
			// - le char suivant est une lettre (ou "/" puis lettre)
			// - le char non-blanc précédent n'est PAS un ident ni ")"
			const next = text[i + 1];
			const looksLikeTag =
				(next === "/" && isTagStart(text[i + 2])) || isTagStart(next);
			const p = prevNonSpace(text, i);
			const okLeft = p < 0 || (!isIdent(text[p]) && text[p] !== ")");

			if (looksLikeTag && okLeft) {
				// Marque "<" ou "</"
				if (next === "/") {
					out.push({ start: i, end: i + 2, type: "jsxBracket" });
					i += 2;
				} else {
					out.push({ start: i, end: i + 1, type: "jsxBracket" });
					i += 1;
				}

				// Avance jusqu’au '>' en gérant quotes et {…}
				let j = i;
				let quote: null | "'" | '"' = null;
				let brace = 0;
				while (j < n) {
					const ch = text[j];
					if (quote) {
						if (ch === quote && text[j - 1] !== "\\") quote = null;
					} else {
						if (ch === "{") brace++;
						else if (ch === "}") brace = Math.max(0, brace - 1);
						else if (ch === "'" || ch === '"') quote = ch;
						else if (ch === ">" && brace === 0) {
							// Marque ">" ou "/>"
							if (text[j - 1] === "/") {
								out.push({ start: j - 1, end: j + 1, type: "jsxBracket" });
							} else {
								out.push({ start: j, end: j + 1, type: "jsxBracket" });
							}
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

	return out;
}
