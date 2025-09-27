// src/editor/Editor.tsx — prise en compte du caret pour le surlignage de la paire active
import React, {
	useEffect,
	useMemo,
	useRef,
	useState,
	useImperativeHandle,
} from "react";
import { EditorProps, EditorHandle } from "./types/editor-props";
import { getTheme } from "./default-theme";
import { getKeywords } from "./keywords/keywords";
import {
	renderHighlightedHTML,
	getHighlightCSSVars,
} from "./highlight-renderer";
import "./editor.css";
import { bootHighlight } from "./boot-highlight";
bootHighlight();

function borderColorFor(bg: string): string {
	try {
		let r = 255,
			g = 255,
			b = 255;
		const hex = bg.trim();
		if (/^#([\da-f]{3}){1,2}$/i.test(hex)) {
			const h = hex.slice(1);
			if (h.length === 3) {
				r = parseInt(h[0] + h[0], 16);
				g = parseInt(h[1] + h[1], 16);
				b = parseInt(h[2] + h[2], 16);
			} else {
				r = parseInt(h.slice(0, 2), 16);
				g = parseInt(h.slice(2, 4), 16);
				b = parseInt(h.slice(4, 6), 16);
			}
		} else if (/^rgb\s*\(/i.test(hex)) {
			const parts = hex
				.replace(/rgba?\(|\)/gi, "")
				.split(/\s*,\s*/)
				.map(Number);
			[r, g, b] = parts as any;
		}
		const luma = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
		return luma < 0.5 ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.14)";
	} catch {
		return "rgba(0,0,0,0.14)";
	}
}

function getCaretPosition(textarea: HTMLTextAreaElement) {
	const div = document.createElement("div");
	const style = getComputedStyle(textarea);
	const props = [
		"boxSizing",
		"width",
		"height",
		"overflow",
		"borderTopWidth",
		"borderRightWidth",
		"borderBottomWidth",
		"borderLeftWidth",
		"paddingTop",
		"paddingRight",
		"paddingBottom",
		"paddingLeft",
		"fontFamily",
		"fontSize",
		"fontWeight",
		"fontStyle",
		"letterSpacing",
		"textTransform",
		"textIndent",
		"whiteSpace",
		"wordWrap",
		"lineHeight",
		"tabSize",
	] as const;
	props.forEach((p) => ((div.style as any)[p] = (style as any)[p]));
	div.style.position = "absolute";
	div.style.visibility = "hidden";
	div.style.whiteSpace = "pre-wrap";
	div.style.wordWrap = "break-word";

	const value = textarea.value;
	const sel = textarea.selectionStart ?? 0;
	div.textContent = value.substring(0, sel);
	const span = document.createElement("span");
	span.textContent = value.substring(sel) || ".";
	div.appendChild(span);

	textarea.parentElement?.appendChild(div);
	const top = span.offsetTop;
	const left = span.offsetLeft;
	const lineHeight = parseFloat(style.lineHeight || "16");
	div.remove();
	return { top, left, lineHeight };
}

type MenuState = {
	open: boolean;
	items: string[];
	selected: number;
	top: number;
	left: number;
	wordStart: number;
	prefix: string;
};
const initialMenu: MenuState = {
	open: false,
	items: [],
	selected: 0,
	top: 0,
	left: 0,
	wordStart: 0,
	prefix: "",
};

const PAIRS: Record<string, string> = { "(": ")", "[": "]", "{": "}" };
const CLOSERS = new Set(Object.values(PAIRS));

const BRACE_LANGS = new Set([
	"javascript",
	"typescript",
	"jsx",
	"tsx",
	"java",
	"c",
	"cpp",
	"c++",
	"csharp",
	"cs",
	"kotlin",
	"swift",
	"go",
	"rust",
	"php",
]);
const isBraceLanguage = (lang?: string) =>
	!!lang && BRACE_LANGS.has(lang.toLowerCase());
const isPythonLanguage = (lang?: string) =>
	(lang ?? "").toLowerCase().startsWith("python");
const INDENT_UNIT = "    ";

function prevNonWhitespace(text: string, from: number) {
	let i = from - 1;
	while (i >= 0 && /\s/.test(text[i])) i--;
	return i;
}
function nextNonWhitespace(text: string, from: number) {
	let i = from;
	while (i < text.length && /\s/.test(text[i])) i++;
	return i;
}

const Editor = React.forwardRef<EditorHandle, EditorProps>((props, ref) => {
	const {
		value,
		onChange,
		language,
		numberOfLines = true,
		theme: rawTheme,
		readOnly: readOnlyProp = false,
	} = props;

	const rootRef = useRef<HTMLDivElement | null>(null);
	const surfaceRef = useRef<HTMLDivElement | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	const [internal, setInternal] = useState(value);
	const [menu, setMenu] = useState<MenuState>(initialMenu);
	const [isRO, setIsRO] = useState(!!readOnlyProp);

	// NEW: caret position for active-pair highlight
	const [caretPos, setCaretPos] = useState(0);
	const updateCaret = () =>
		setCaretPos(textareaRef.current?.selectionStart ?? 0);

	if (!onChange && !isRO) {
		throw new Error(
			"The 'onChange' prop is required when not in read-only mode."
		);
	}

	useImperativeHandle(
		ref,
		() => ({
			focus: () => textareaRef.current?.focus(),
			setReadOnly: (ro: boolean) => setIsRO(!!ro),
			isReadOnly: () => isRO,
		}),
		[isRO]
	);

	useEffect(() => {
		setIsRO(!!readOnlyProp);
	}, [readOnlyProp]);

	const theme = getTheme(rawTheme);
	const { fontFamily, fontSize } = theme;
	const borderColor = borderColorFor(theme.backgroundColor);

	const lineCount = useMemo(
		() => Math.max(1, internal.split("\n").length),
		[internal]
	);

	const ensureCaretVisible = (extraBottom = 0) => {
		const root = rootRef.current,
			ta = textareaRef.current,
			surface = surfaceRef.current;
		if (!root || !ta || !surface) return;
		const { top, lineHeight } = getCaretPosition(ta);
		const caretTop = surface.offsetTop + ta.offsetTop + top;
		const caretBottom = caretTop + lineHeight + extraBottom;
		const viewTop = root.scrollTop;
		const viewBottom = viewTop + root.clientHeight;
		const margin = 8;
		if (caretBottom > viewBottom - margin)
			root.scrollTop = caretBottom - root.clientHeight + margin;
		else if (caretTop < viewTop + margin) root.scrollTop = caretTop - margin;
	};

	useEffect(() => {
		const ta = textareaRef.current;
		if (!ta) return;
		ta.style.height = "auto";
		ta.style.height = ta.scrollHeight + "px";
		requestAnimationFrame(() => ensureCaretVisible(menu.open ? 200 : 0));
	}, [internal, menu.open]);

	useEffect(() => {
		if (isRO && menu.open) setMenu(initialMenu);
	}, [isRO, menu.open]);

	useEffect(() => {
		setInternal(value);
	}, [value]);

	const getLineStart = (text: string, pos: number) => {
		const before = text.slice(0, pos);
		const lastNL = before.lastIndexOf("\n");
		return lastNL === -1 ? 0 : lastNL + 1;
	};
	const getLineIndent = (text: string, pos: number) => {
		const start = getLineStart(text, pos);
		const match = /^\s*/.exec(text.slice(start));
		return match ? match[0] : "";
	};

	const replaceSelection = (
		el: HTMLTextAreaElement,
		insert: string,
		selectStartOffset?: number,
		selectEndOffset?: number
	) => {
		const { selectionStart, selectionEnd, value } = el;
		const before = value.slice(0, selectionStart);
		const after = value.slice(selectionEnd);
		const next = before + insert + after;

		const collapse =
			selectStartOffset === undefined && selectEndOffset === undefined;
		const caretStart = collapse
			? before.length + insert.length
			: before.length + (selectStartOffset ?? 0);
		const caretEnd = collapse
			? caretStart
			: before.length + insert.length - (selectEndOffset ?? 0);

		setInternal(next);
		onChange!(next);
		requestAnimationFrame(() => {
			el.focus();
			el.selectionStart = caretStart;
			el.selectionEnd = caretEnd;
			setCaretPos(caretStart); // NEW
			ensureCaretVisible();
		});
	};

	const getCurrentWord = (text: string, caret: number) => {
		const isWord = (c: string) => /[A-Za-z0-9_]/.test(c);
		let i = caret - 1;
		while (i >= 0 && isWord(text[i])) i--;
		const start = i + 1;
		const prefix = text.slice(start, caret);
		return { start, prefix };
	};

	const openMenu = (items: string[], wordStart: number, prefix: string) => {
		if (!textareaRef.current || !surfaceRef.current) return;
		const { top, left, lineHeight } = getCaretPosition(textareaRef.current);
		const gutterOffset = numberOfLines ? 56 : 0;
		setMenu({
			open: true,
			items,
			selected: 0,
			top: top + lineHeight,
			left: gutterOffset + left,
			wordStart,
			prefix,
		});
		requestAnimationFrame(() => ensureCaretVisible(200));
	};
	const closeMenu = () => setMenu(initialMenu);

	const updateCompletions = (force = false) => {
		if (isRO) return;
		const el = textareaRef.current;
		if (!el) return;
		const { selectionStart } = el;
		const { start, prefix } = getCurrentWord(el.value, selectionStart);
		if (!force && prefix.length === 0) {
			if (menu.open) closeMenu();
			return;
		}
		const list = getKeywords(language).filter((k) =>
			k.toLowerCase().startsWith(prefix.toLowerCase())
		);
		if (list.length === 0) {
			if (menu.open) closeMenu();
			return;
		}
		openMenu(list, start, prefix);
	};

	const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
		e
	) => {
		const el = e.currentTarget;

		if (isRO) {
			if (menu.open) closeMenu();
			return;
		}

		if (PAIRS[e.key]) {
			e.preventDefault();
			const open = e.key,
				close = PAIRS[open];
			const { selectionStart, selectionEnd, value } = el;
			if (selectionStart !== selectionEnd) {
				const before = value.slice(0, selectionStart);
				const selected = value.slice(selectionStart, selectionEnd);
				const after = value.slice(selectionEnd);
				const next = before + open + selected + close + after;
				setInternal(next);
				onChange!(next);
				requestAnimationFrame(() => {
					const start = before.length + 1;
					const end = start + selected.length;
					el.selectionStart = start;
					el.selectionEnd = end;
					setCaretPos(start); // NEW
					ensureCaretVisible();
				});
			} else {
				replaceSelection(el, open + close, 1, 1);
			}
			return;
		}

		if (CLOSERS.has(e.key)) {
			const pos = el.selectionStart;
			const nextCh = el.value[pos];
			if (nextCh === e.key) {
				e.preventDefault();
				requestAnimationFrame(() => {
					el.selectionStart = pos + 1;
					el.selectionEnd = pos + 1;
					setCaretPos(pos + 1); // NEW
					ensureCaretVisible();
				});
				return;
			}
		}

		if ((e.ctrlKey || e.metaKey) && e.key === " ") {
			e.preventDefault();
			updateCompletions(true);
			return;
		}

		if (menu.open) {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setMenu((m) => ({ ...m, selected: (m.selected + 1) % m.items.length }));
				return;
			}
			if (e.key === "ArrowUp") {
				e.preventDefault();
				setMenu((m) => ({
					...m,
					selected: (m.selected - 1 + m.items.length) % m.items.length,
				}));
				return;
			}
			if (e.key === "Enter" || e.key === "Tab") {
				e.preventDefault();
				const choice = menu.items[menu.selected];
				const before = el.value.slice(0, menu.wordStart);
				const after = el.value.slice(el.selectionStart);
				const next = before + choice + after;
				setInternal(next);
				onChange!(next);
				const newCaret = before.length + choice.length;
				requestAnimationFrame(() => {
					el.selectionStart = newCaret;
					el.selectionEnd = newCaret;
					setCaretPos(newCaret); // NEW
					ensureCaretVisible();
				});
				closeMenu();
				return;
			}
			if (e.key === "Escape") {
				e.preventDefault();
				closeMenu();
				return;
			}
		}

		if (e.key === "Tab") {
			e.preventDefault();
			const { selectionStart, selectionEnd, value } = el;
			const indent = "    ";
			if (selectionStart !== selectionEnd) {
				const startLine = getLineStart(value, selectionStart);
				const segment = value.slice(startLine, selectionEnd);
				const lines = segment.split("\n");
				if (!e.shiftKey) {
					const indented = lines.map((l) => indent + l).join("\n");
					const next =
						value.slice(0, startLine) + indented + value.slice(selectionEnd);
					const delta = indent.length * lines.length;
					setInternal(next);
					onChange!(next);
					requestAnimationFrame(() => {
						el.selectionStart = selectionStart + indent.length;
						el.selectionEnd = selectionEnd + delta;
						setCaretPos(el.selectionStart); // NEW
						ensureCaretVisible();
					});
				} else {
					const outdented = lines
						.map((l) =>
							l.startsWith(indent)
								? l.slice(indent.length)
								: l.replace(/^\t/, "")
						)
						.join("\n");
					const next =
						value.slice(0, startLine) + outdented + value.slice(selectionEnd);
					setInternal(next);
					onChange!(next);
					requestAnimationFrame(() => {
						el.selectionStart = Math.max(
							startLine,
							selectionStart - indent.length
						);
						el.selectionEnd = Math.max(
							startLine,
							selectionEnd - indent.length * lines.length
						);
						setCaretPos(el.selectionStart); // NEW
						ensureCaretVisible();
					});
				}
				return;
			}
			if (!e.shiftKey) replaceSelection(el, indent);
			return;
		}

		if (e.key === "Enter") {
			e.preventDefault();
			const pos = el.selectionStart;
			const value = el.value;
			const indent = getLineIndent(value, pos);

			if (isPythonLanguage(language)) {
				const prevIdx = prevNonWhitespace(value, pos);
				if (prevIdx >= 0 && value[prevIdx] === ":") {
					const insert = "\n" + indent + INDENT_UNIT;
					replaceSelection(el, insert);
					return;
				}
			}

			if (isBraceLanguage(language)) {
				const prevIdx = prevNonWhitespace(value, pos);
				const nextIdx = nextNonWhitespace(value, pos);
				const prevIsOpen = prevIdx >= 0 && value[prevIdx] === "{";
				const nextIsClose = nextIdx < value.length && value[nextIdx] === "}";

				if (prevIsOpen && nextIsClose) {
					const before = value.slice(0, pos);
					const after = value.slice(nextIdx + 1);
					const insert = "\n" + indent + INDENT_UNIT + "\n" + indent + "}";
					const nextValue = before + insert + after;
					const caretOffset = ("\n" + indent + INDENT_UNIT).length;
					setInternal(nextValue);
					onChange!(nextValue);

					requestAnimationFrame(() => {
						const newPos = before.length + caretOffset;
						el.selectionStart = newPos;
						el.selectionEnd = newPos;
						setCaretPos(newPos); // NEW
						ensureCaretVisible();
					});
					return;
				}
			}

			replaceSelection(el, "\n" + indent);
			return;
		}
	};

	const handleInput: React.ChangeEventHandler<HTMLTextAreaElement> = () => {
		if (isRO) return;
		const el = textareaRef.current!;
		const ch = el.value[el.selectionStart - 1] || "";
		if (/[A-Za-z0-9_]/.test(ch)) updateCompletions(false);
		else if (menu.open) updateCompletions(false);
		requestAnimationFrame(() => {
			setCaretPos(el.selectionStart ?? 0); // NEW
			ensureCaretVisible(menu.open ? 200 : 0);
		});
	};

	// Use caretPos for active bracket pair
	const highlightedHTML = renderHighlightedHTML(internal, language, caretPos);
	const highlightVars = getHighlightCSSVars("vscode-dark");

	return (
		<div
			ref={rootRef}
			className={`editor-root${isRO ? " is-readonly" : ""}`}
			style={{
				backgroundColor: theme.backgroundColor,
				color: theme.color,
				border: `1px solid ${borderColor}`,
				...highlightVars,
			}}
		>
			<div
				ref={surfaceRef}
				className="editor-surface"
				style={{ fontFamily, fontSize, lineHeight: theme.lineHeight }}
			>
				{numberOfLines && (
					<div className="editor-gutter" aria-hidden>
						<div className="editor-gutter-inner">
							{Array.from({ length: lineCount }).map((_, i) => (
								<div key={i}>{i + 1}</div>
							))}
						</div>
					</div>
				)}

				<div className="editor-pane">
					<pre
						className="editor-highlight"
						aria-hidden
						dangerouslySetInnerHTML={{ __html: highlightedHTML + "\n" }}
						style={{ lineHeight: theme.lineHeight, padding: theme.padding }}
					/>
					<textarea
						ref={textareaRef}
						spellCheck={false}
						value={internal}
						readOnly={isRO}
						aria-readonly={isRO || undefined}
						onChange={(e) => {
							if (isRO) return;
							setInternal(e.target.value);
							onChange!(e.target.value);
							handleInput(e);
						}}
						onKeyDown={handleKeyDown}
						onKeyUp={updateCaret}
						onSelect={updateCaret}
						onMouseUp={updateCaret}
						onClick={updateCaret}
						className={`editor-textarea editor-text-transparent${
							isRO ? " is-ro-textarea" : ""
						}`}
						style={{
							lineHeight: theme.lineHeight,
							padding: theme.padding,
							tabSize: 8 as any,
							caretColor: theme.color,
						}}
					/>
				</div>

				{menu.open && !isRO && (
					<div
						className="completion-menu"
						role="listbox"
						style={{ top: menu.top, left: menu.left }}
						onMouseDown={(e) => e.preventDefault()}
					>
						{menu.items.map((item, idx) => (
							<div
								key={item + idx}
								role="option"
								aria-selected={idx === menu.selected}
								className={`completion-item ${
									idx === menu.selected ? "is-active" : ""
								}`}
								onMouseEnter={() => setMenu((m) => ({ ...m, selected: idx }))}
								onMouseDown={() => {
									const el = textareaRef.current!;
									const before = el.value.slice(0, menu.wordStart);
									const after = el.value.slice(el.selectionStart);
									const next = before + item + after;
									setInternal(next);
									onChange!(next);
									const newCaret = before.length + item.length;
									requestAnimationFrame(() => {
										el.focus();
										el.selectionStart = newCaret;
										el.selectionEnd = newCaret;
										setCaretPos(newCaret); // NEW
										ensureCaretVisible();
									});
									closeMenu();
								}}
							>
								{item}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
});

export default Editor;
export type { EditorHandle };
