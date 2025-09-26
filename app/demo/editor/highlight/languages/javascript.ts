// src/highlight/languages/javascript.ts
import type { Language } from "../types";

const keywords = [
	"break",
	"case",
	"catch",
	"class",
	"const",
	"continue",
	"debugger",
	"default",
	"delete",
	"do",
	"else",
	"enum",
	"export",
	"extends",
	"false",
	"finally",
	"for",
	"function",
	"if",
	"import",
	"in",
	"instanceof",
	"let",
	"new",
	"null",
	"return",
	"super",
	"switch",
	"this",
	"throw",
	"true",
	"try",
	"typeof",
	"var",
	"void",
	"while",
	"with",
	"yield",
	"async",
	"await",
];
const kwRe = new RegExp(`\\b(?:${keywords.join("|")})\\b`, "g");

// Rem: on reste simple (pas de nested template, ni heuristiques avancées)
export const javascriptLanguage: Language = {
	id: "javascript",
	name: "JavaScript",
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

		// nombres
		{
			pattern:
				/\b(?:0x[\da-fA-F]+|0b[01]+|0o[0-7]+|\d+(\.\d+)?([eE][+-]?\d+)?)\b/g,
			type: "number",
			priority: 3,
		},

		// keywords / boolean / null
		{ pattern: kwRe, type: "keyword", priority: 4 },

		// fonction: ident avant (
		{
			pattern: /\b([A-Za-z_$][\w$]*)(?=\s*\()/g,
			type: "function",
			priority: 5,
		},

		// bool/null (redondant mais utile si on veut un style diff)
		{ pattern: /\b(?:true|false)\b/g, type: "boolean", priority: 6 },
		{ pattern: /\b(?:null|undefined)\b/g, type: "null", priority: 6 },

		// opérateurs / ponctuation (très simple)
		{ pattern: /[+\-/*%=!<>|&^~?:]+/g, type: "operator", priority: 7 },
		{ pattern: /[{}()[\].,;]/g, type: "punctuation", priority: 8 },
	],
};
