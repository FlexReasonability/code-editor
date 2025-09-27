// src/highlight/themes/vscodeDark.ts
import type { ThemeColors } from "../types";

export const darkTheme: ThemeColors = {
	// Couleurs inspirées de VS Code Dark+
	keyword: "#c586c0",
	keywordDecl: "#569cd6", // 👈 distinct pour const/let/var/function
	comment: "#6a9955",
	string: "#ce9178",
	number: "#b5cea8",
	boolean: "#569cd6",
	null: "#569cd6",
	regex: "#d16969",
	function: "#dcdcaa",
	variable: "#9cdcfe",
	property: "#9cdcfe",
	operator: "#d4d4d4",
	punctuation: "#d4d4d4",
	type: "#4ec9b0",
	// JSX
	jsxTag: "#569cd6", // balises HTML
	jsxTagComponent: "#4ec9b0", // 👈 vert d'eau pour composants
	jsxAttr: "#9cdcfe",
	jsxText: "#d4d4d4",
	jsxBracket: "#808080", // 👈 chevrons gris
	// 🌈 Brackets (3 teintes)
	bracket0: "#61AFEF", // bleu
	bracket1: "#E5C07B", // jaune
	bracket2: "#C678DD", // rose
	bracketUnmatched: "#ff6b6b",
	bracketActive: "#ffffff",
};
