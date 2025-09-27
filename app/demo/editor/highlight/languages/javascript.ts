// src/highlight/languages/javascript.ts — ajoute la coloration de "=>" comme keywordDecl
import type { Language } from "../types";

const keywords = [
	"break",
	"case",
	"catch",
	"class",
	"continue",
	"debugger",
	"default",
	"delete",
	"do",
	"else",
	"enum",
	"export",
	"extends",
	"finally",
	"for",
	"if",
	"import",
	"in",
	"instanceof",
	"new",
	"return",
	"super",
	"switch",
	"this",
	"throw",
	"try",
	"typeof",
	"void",
	"while",
	"with",
	"yield",
	"async",
	"await",
];

// mots-clés de déclaration (couleur spéciale)
const declKeywords = ["const", "let", "var", "function", "true", "false"];

const kwRe = new RegExp(`\\b(?:${keywords.join("|")})\\b`, "g");
const kwDeclRe = new RegExp(`\\b(?:${declKeywords.join("|")})\\b`, "g");

export const javascriptLanguage: Language = {
	id: "javascript",
	name: "JavaScript / JSX",
	rules: [
		// commentaires
		{ pattern: /\/\/[^\n]*/g, type: "comment", priority: 0 },
		{ pattern: /\/\*[\s\S]*?\*\//g, type: "comment", priority: 0 },

		// strings / template
		{ pattern: /'(?:\\.|[^'\\])*'/g, type: "string", priority: 1 },
		{ pattern: /"(?:\\.|[^"\\])*"/g, type: "string", priority: 1 },
		{ pattern: /`(?:\\.|[^`\\])*`/g, type: "string", priority: 1 },

		// regex literal (simple heuristique)
		{
			pattern: /(^|[=(,:;\s])\/(?!\s)(?:\\.|[^/\\\n])+\/[gimsuy]*/g,
			type: "regex",
			priority: 2,
		},

		// mots-clés de déclaration (couleur spéciale)
		{ pattern: kwDeclRe, type: "keywordDecl" },

		// 🔹 flèche des fonctions (=>) : même style que keywordDecl
		{ pattern: /=>/g, type: "keywordDecl" },

		// nombres
		{
			pattern:
				/\b(?:0x[\da-fA-F]+|0b[01]+|0o[0-7]+|\d+(\.\d+)?([eE][+-]?\d+)?)\b/g,
			type: "number",
			priority: 3,
		},

		// autres keywords
		{ pattern: kwRe, type: "keyword", priority: 4 },

		// fonction: ident avant (
		{
			pattern: /\b([A-Za-z_$][\w$]*)(?=\s*\()/g,
			type: "function",
			priority: 5,
		},

		// bool/null (si tu veux une couleur différente des declKeywords, garde ces règles)
		{ pattern: /\b(?:true|false)\b/g, type: "boolean", priority: 6 },
		{ pattern: /\b(?:null|undefined)\b/g, type: "null", priority: 6 },

		// opérateurs / ponctuation
		{ pattern: /[+\-/*%=!<>|&^~?:]+/g, type: "operator", priority: 7 },
		{ pattern: /[{}()[\].,;]/g, type: "punctuation", priority: 8 },

		// JSX: composants (majuscule) et balises HTML (minuscule)
		{
			pattern: /(?<=<\/?)[A-Z][A-Za-z0-9._:\-]*/g,
			type: "jsxTagComponent",
			priority: 9,
		},
		{
			pattern: /(?<=<\/?)[a-z][A-Za-z0-9._:\-]*/g,
			type: "jsxTag",
			priority: 10,
		},

		// JSX: attributs + texte
		{
			pattern: /(?<=\s)[A-Za-z_:][A-Za-z0-9_:.\-]*(?=\s*=)/g,
			type: "jsxAttr",
			priority: 11,
		},
		{ pattern: /(?<=>)[^<{}\n][^<{}]*/g, type: "jsxText", priority: 12 },

		// propriétés & variables
		{ pattern: /(?<=\.)[A-Za-z_$][\w$]*/g, type: "property", priority: 13 },
		{
			pattern: /(?<!\.)\b[A-Za-z_$][\w$]*\b(?!\s*\()/g,
			type: "variable",
			priority: 14,
		},
	],
};
