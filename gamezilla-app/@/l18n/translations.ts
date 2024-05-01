import { LanguageCodeISO_639_1 } from "./lang-code-iso-639-1/lang-code-iso-639-1";

export type TranslationText = {
	[key: string]: string | ((...args: any[]) => string);
};

export type Translations<TText extends TranslationText> = {
	[lang in LanguageCodeISO_639_1]: TText;
};

export const createTranslator =
	<TTranslationText extends TranslationText>(text: TTranslationText) =>
	<
		K extends keyof TTranslationText,
		Args extends TTranslationText[K] extends (...args: any[]) => any
			? Parameters<TTranslationText[K]>
			: [],
	>(
		key: K,
		...args: Args
	): string => {
		const translation = text[key];

		if (typeof translation === "function") {
			const result = translation(...(args as any));
			return result;
		}

		return translation!;
	};
