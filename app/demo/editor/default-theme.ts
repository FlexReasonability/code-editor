import { Theme } from "./types/editor-props";

const defaultThemes: Record<string, Theme> = {
	light: {
		backgroundColor: "#ffffff",
		color: "#1a1a1a",
		fontSize: "14px",
		fontFamily:
			"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
		lineHeight: "1.6",
		padding: "12px",
	},
	dark: {
		backgroundColor: "#1E1E1E",
		color: "#D4D4D4",
		fontSize: "14px",
		fontFamily:
			"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
		lineHeight: "1.6",
		padding: "12px",
	},
	solarized: {
		backgroundColor: "#fdf6e3",
		color: "#657b83",
		fontSize: "14px",
		fontFamily:
			"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
		lineHeight: "1.6",
		padding: "12px",
	},
};

const getTheme = (theme: string | Theme): Theme => {
	if (typeof theme === "string") {
		return defaultThemes[theme] || defaultThemes.dark;
	}
	return theme;
};
export { getTheme, defaultThemes };
