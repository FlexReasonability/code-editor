// src/highlight/brackets.ts
// ✅ Modulo 3 pour n’utiliser que bracket0/bracket1/bracket2
import type { Token } from "./types";

const OPEN = "([{";
const CLOSE = ")]}";
const PAIR: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
const RAINBOW_COLORS = 3; // ⬅️ seulement 3 couleurs

type StackItem = { ch: string; idx: number; depth: number };

function isOpen(ch: string) {
	return OPEN.includes(ch);
}
function isClose(ch: string) {
	return CLOSE.includes(ch);
}

export function computeBracketTokens(
	text: string,
	maskedTokens: Token[] = [],
	caretPos?: number
): Token[] {
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

	const stack: StackItem[] = [];
	const depthMap = new Map<number, number>();
	const unmatched = new Set<number>();
	const pairMap = new Map<number, number>();

	for (let i = 0; i < text.length; i++) {
		if (masked[i]) continue;
		const ch = text[i];
		if (isOpen(ch)) {
			stack.push({ ch, idx: i, depth: stack.length });
		} else if (isClose(ch)) {
			const need = PAIR[ch];
			if (stack.length && stack[stack.length - 1].ch === need) {
				const open = stack.pop()!;
				depthMap.set(open.idx, open.depth);
				depthMap.set(i, open.depth);
				pairMap.set(open.idx, i);
				pairMap.set(i, open.idx);
			} else {
				unmatched.add(i);
			}
		}
	}
	for (const o of stack) unmatched.add(o.idx);

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

	const tokens: Token[] = [];
	for (const [idx, depth] of depthMap.entries()) {
		if (activeA === idx || activeB === idx) continue;
		const d = ((depth % RAINBOW_COLORS) + RAINBOW_COLORS) % RAINBOW_COLORS;
		const type = `bracket${d}` as Token["type"];
		tokens.push({ start: idx, end: idx + 1, type });
	}
	for (const idx of unmatched) {
		if (idx === activeA || idx === activeB) continue;
		if (!depthMap.has(idx))
			tokens.push({ start: idx, end: idx + 1, type: "bracketUnmatched" });
	}
	if (activeA !== undefined && activeB !== undefined) {
		tokens.push({ start: activeA, end: activeA + 1, type: "bracketActive" });
		tokens.push({ start: activeB, end: activeB + 1, type: "bracketActive" });
	}
	tokens.sort((a, b) => a.start - b.start || b.end - a.end);
	return tokens;
}
