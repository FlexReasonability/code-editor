// src/highlight/types.ts — ajoute la priorité sur les tokens
export type TokenType =
	| "comment"
	| "string"
	| "number"
	| "keyword"
	| "keywordDecl"
	| "boolean"
	| "null"
	| "regex"
	| "operator"
	| "punctuation"
	| "function"
	| "variable"
	| "property"
	| "type"
	| "jsxTag"
	| "jsxTagComponent"
	| "jsxAttr"
	| "jsxText"
	| "jsxBracket"
	| "bracket0"
	| "bracket1"
	| "bracket2"
	| "bracketUnmatched"
	| "bracketActive";

export interface Token {
	start: number;
	end: number;
	type: TokenType;
	/** priorité effective (plus grand = prime) */
	prio?: number;
}

export interface Rule {
	pattern: RegExp;
	type: TokenType;
	/** priorité suggérée par la règle (facultatif) */
	priority?: number;
}

export interface Language {
	id: string;
	name?: string;
	rules: Rule[];
}

export type ThemeColors = Partial<Record<TokenType, string>>;
