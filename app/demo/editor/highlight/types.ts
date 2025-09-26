// src/highlight/types.ts
export type TokenType =
	| "comment"
	| "string"
	| "number"
	| "keyword"
	| "boolean"
	| "null"
	| "regex"
	| "operator"
	| "punctuation"
	| "function"
	| "variable"
	| "property"
	| "type";

export interface Token {
	start: number; // inclusive
	end: number; // exclusive
	type: TokenType;
}

export interface Rule {
	/** Global regex (avec le flag /g !) */
	pattern: RegExp;
	type: TokenType;
	/** Priorité: plus petit = appliqué en premier (par défaut: index d'insertion) */
	priority?: number;
}

export interface Language {
	id: string;
	name?: string;
	rules: Rule[];
}

export type ThemeColors = Partial<Record<TokenType, string>>;
