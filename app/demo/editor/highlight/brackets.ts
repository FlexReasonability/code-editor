// src/highlight/brackets.ts
// 🌈 Rotation des couleurs PAR TYPE de brackets (pile dédiée pour (), [], {}).
// La couleur est déterminée par (profondeur_du_type % 3) :
//   0 -> bracket0 (bleu), 1 -> bracket1 (jaune), 2 -> bracket2 (rose)

import type { Token } from "./types";

type StackItem = { idx: number; depth: number };

const GROUPS = {
	paren: { open: "(", close: ")" },
	bracket: { open: "[", close: "]" },
	brace: { open: "{", close: "}" },
} as const;

type GroupKey = keyof typeof GROUPS;

const OPEN_TO_GROUP: Record<string, GroupKey> = {
	"(": "paren",
	"[": "bracket",
	"{": "brace",
};
const CLOSE_TO_GROUP: Record<string, GroupKey> = {
	")": "paren",
	"]": "bracket",
	"}": "brace",
};

const ALL_OPEN = "([{";
const ALL_CLOSE = ")]}";

function isOpen(ch: string) {
	return ALL_OPEN.includes(ch);
}
function isClose(ch: string) {
	return ALL_CLOSE.includes(ch);
}

export function computeBracketTokens(
	text: string,
	maskedTokens: Token[] = [],
	caretPos?: number
): Token[] {
	// Masquer les zones à ignorer (strings, commentaires, regex, texte JSX)
	const masked = new Array<boolean>(text.length).fill(false);
	for (const t of maskedTokens) {
		if (
			t.type === "string" ||
			t.type === "comment" ||
			t.type === "regex" ||
			t.type === "jsxText"
		) {
			for (let i = t.start; i < t.end && i < text.length; i++) masked[i] = true;
		}
	}

	// Une pile PAR TYPE de bracket
	const stacks: Record<GroupKey, StackItem[]> = {
		paren: [],
		bracket: [],
		brace: [],
	};

	// Profondeur par index (ouvrant ET fermant), mappage de paires et non appariés
	const depthMap = new Map<number, number>(); // index -> profondeur (du type)
	const pairMap = new Map<number, number>(); // index -> index apparié
	const unmatched = new Set<number>();

	// 1) Parcours du texte : on calcule la profondeur par TYPE
	for (let i = 0; i < text.length; i++) {
		if (masked[i]) continue;
		const ch = text[i];

		if (isOpen(ch)) {
			const g = OPEN_TO_GROUP[ch];
			const depth = stacks[g].length; // profondeur AVANT push pour ce type
			stacks[g].push({ idx: i, depth });
			depthMap.set(i, depth);
		} else if (isClose(ch)) {
			const g = CLOSE_TO_GROUP[ch];
			const stack = stacks[g];
			if (stack.length) {
				const open = stack.pop()!;
				const depth = open.depth; // même profondeur pour le fermant
				depthMap.set(i, depth);
				pairMap.set(open.idx, i);
				pairMap.set(i, open.idx);
			} else {
				unmatched.add(i);
			}
		}
	}

	// Ouvrants restés sans fermeture => unmatched
	for (const g of Object.keys(stacks) as GroupKey[]) {
		for (const o of stacks[g]) unmatched.add(o.idx);
	}

	// 2) Paire active autour du caret (si existante)
	let activeA: number | undefined;
	let activeB: number | undefined;
	if (typeof caretPos === "number") {
		const left = caretPos - 1;
		const right = caretPos;
		if (
			left >= 0 &&
			(isOpen(text[left]) || isClose(text[left])) &&
			pairMap.has(left)
		) {
			activeA = left;
			activeB = pairMap.get(left);
		} else if (
			right < text.length &&
			(isOpen(text[right]) || isClose(text[right])) &&
			pairMap.has(right)
		) {
			activeA = right;
			activeB = pairMap.get(right);
		}
	}

	// 3) Construction des tokens avec rotation par (depth % 3)
	const tokens: Token[] = [];

	if (activeA !== undefined && activeB !== undefined) {
		tokens.push({ start: activeA, end: activeA + 1, type: "bracketActive" });
		tokens.push({ start: activeB, end: activeB + 1, type: "bracketActive" });
	}

	for (const [idx, depth] of depthMap.entries()) {
		if (idx === activeA || idx === activeB) continue;
		const mod = ((depth % 3) + 3) % 3; // 0..2
		const type = `bracket${mod}` as Token["type"]; // bracket0 / bracket1 / bracket2
		tokens.push({ start: idx, end: idx + 1, type });
	}

	for (const idx of unmatched) {
		if (idx === activeA || idx === activeB) continue;
		tokens.push({ start: idx, end: idx + 1, type: "bracketUnmatched" });
	}

	tokens.sort((a, b) => a.start - b.start || b.end - a.end);
	return tokens;
}
