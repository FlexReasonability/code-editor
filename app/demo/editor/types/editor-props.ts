interface Theme {
    backgroundColor: string;
    color: string;
    fontSize: string;
    fontFamily: string;
    lineHeight: string;
    padding: string;
}

interface EditorProps {
	value: string;
	onChange?: (newValue: string) => void;
	language?: string;
	theme: Theme | string;
	numberOfLines?: boolean;
	readOnly?: boolean;
}

type EditorHandle = {
	focus: () => void;
	/** Active/désactive la lecture seule au runtime */
	setReadOnly: (ro: boolean) => void;
	/** Retourne l’état courant */
	isReadOnly: () => boolean;
};

export type { EditorProps, Theme, EditorHandle };