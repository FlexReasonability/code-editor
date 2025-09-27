// src/highlight/priority.ts
import { TokenType } from "./types";

export function tokenPriority(t: TokenType): number {
	switch (t) {
		// Forts: ne jamais écraser
		case "string":
		case "comment":
		case "regex":
			return 100;

		// Chevrons JSX gris (doivent gagner sur operator/variable)
		case "jsxBracket":
			return 95;

		// Brackets appariés/actifs
		case "bracketActive":
			return 92;
		case "bracketUnmatched":
			return 91;
		case "bracket0":
		case "bracket1":
		case "bracket2":
			return 90;

		// JSX
		case "jsxTagComponent":
			return 80;
		case "jsxTag":
			return 78;
		case "jsxAttr":
			return 76;
		case "jsxText":
			return 70;

		// JS
		case "keywordDecl":
			return 68;
		case "keyword":
			return 66;
		case "function":
			return 64;
		case "number":
		case "boolean":
		case "null":
			return 62;
		case "property":
		case "variable":
			return 60;

		case "operator":
			return 50;
		case "punctuation":
			return 40;
		default:
			return 10;
	}
}
