@flexreasonability/editor

Petit module local encapsulant un composant d'éditeur et un moteur de coloration.

But

- Fournir un éditeur React contrôlé (export `Editor`) avec option readOnly et API via ref.
- Fournir un rendu HTML colorisé (`renderHighlightedHTML`) et helpers de thèmes.

Usage (ESM / TypeScript)

```ts
import {
	Editor,
	renderHighlightedHTML,
	bootHighlight,
	getTheme,
} from "@flexreasonability/editor";

// initialisation (optionnelle) — registre des langages/thèmes
bootHighlight();

// utiliser <Editor value={v} onChange={setV} theme="dark" /> dans une app React
```

API principale

- Editor: composant par défaut (React) — props dans `types/editor-props.ts`
- bootHighlight(): enregistre langages & thèmes fournis
- renderHighlightedHTML(text, language?): retourne HTML colorisé (safe)
- getHighlightCSSVars(themeId?): retourne variables CSS pour thème de highlight

Structure

- editor.tsx: composant principal
- highlight/: moteur et fichiers de langages/thèmes
- keywords/: suggestions d'autocomplétion
- types/: types partagés

Licence: MIT
