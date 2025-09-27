// src/highlight/languages/javascript.ts — sépare balises HTML vs composants JSX
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
const declKeywords = ["const", "let", "var", "function", "=>", "true"];

const kwRe = new RegExp(`\\b(?:${keywords.join("|")})\\b`, "g");
const kwDeclRe = new RegExp(`\\b(?:${declKeywords.join("|")})\\b`, "g");

export const javascriptLanguage: Language = {
	id: "javascript",
	name: "JavaScript / JSX",
	rules: [
		{ pattern: /\/\/[^\n]*/g, type: "comment", priority: 0 },
		{ pattern: /\/\*[\s\S]*?\*\//g, type: "comment", priority: 0 },

		{ pattern: /'(?:\\.|[^'\\])*'/g, type: "string", priority: 1 },
		{ pattern: /"(?:\\.|[^"\\])*"/g, type: "string", priority: 1 },
		{ pattern: /`(?:\\.|[^`\\])*`/g, type: "string", priority: 1 },

		{
			pattern: /(^|[=(,:;\s])\/(?!\s)(?:\\.|[^/\\\n])+\/[gimsuy]*/g,
			type: "regex",
			priority: 2,
		},

		{ pattern: kwDeclRe, type: "keywordDecl", priority: 3 },
		{
			pattern:
				/\b(?:0x[\da-fA-F]+|0b[01]+|0o[0-7]+|\d+(\.\d+)?([eE][+-]?\d+)?)\b/g,
			type: "number",
			priority: 3,
		},
		{ pattern: kwRe, type: "keyword", priority: 4 },

		{
			pattern: /\b([A-Za-z_$][\w$]*)(?=\s*\()/g,
			type: "function",
			priority: 5,
		},

		{ pattern: /\b(?:true|false)\b/g, type: "boolean", priority: 6 },
		{ pattern: /\b(?:null|undefined)\b/g, type: "null", priority: 6 },

		{ pattern: /[+\-/*%=!<>|&^~?:]+/g, type: "operator", priority: 7 },
		{ pattern: /[{}()[\].,;]/g, type: "punctuation", priority: 8 },

		// JSX: composants (nom commençant par majuscule)  <MyComp>  </React.Fragment>
		{
			pattern: /(?<=<\/?)[A-Z][A-Za-z0-9._:\-]*/g,
			type: "jsxTagComponent",
			priority: 9,
		},
		// JSX: balises HTML (nom commençant par minuscule) <div> </span>
		{
			pattern: /(?<=<\/?)[a-z][A-Za-z0-9._:\-]*/g,
			type: "jsxTag",
			priority: 10,
		},
		// JSX: attributs dans un tag
		{
			pattern: /(?<=\s)[A-Za-z_:][A-Za-z0-9_:.\-]*(?=\s*=)/g,
			type: "jsxAttr",
			priority: 11,
		},
		// JSX: texte entre balises (simple)
		{ pattern: /(?<=>)[^<{}\n][^<{}]*/g, type: "jsxText", priority: 12 },

		{ pattern: /(?<=\.)[A-Za-z_$][\w$]*/g, type: "property", priority: 13 },
		{
			pattern: /(?<!\.)\b[A-Za-z_$][\w$]*\b(?!\s*\()/g,
			type: "variable",
			priority: 14,
		},
	],
};
