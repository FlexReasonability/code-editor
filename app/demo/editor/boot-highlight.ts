// src/editor/bootHighlight.ts (à appeler au démarrage de la lib)
import { registerLanguage, registerTheme } from "./highlight/registry";
import { javascriptLanguage } from "./highlight/languages/javascript";
import { pythonLanguage } from "./highlight/languages/python";
import { darkTheme } from "./highlight/themes/dark";

export function bootHighlight() {
	registerLanguage(javascriptLanguage);
	registerLanguage(pythonLanguage);
	registerTheme("dark", darkTheme);
}
