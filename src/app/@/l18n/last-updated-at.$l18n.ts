import type { TranslatedText, Translations } from '~/@/l18n'

export type Text = {
  'app.last-updated-at': (timeSpanDescription: TranslatedText) => string
}

export const translations: Translations<Text> = {
  'app.last-updated-at': {
    en: (timeSpanDescription) => `Last updated ${timeSpanDescription.toLowerCase()}`,
    es: (timeSpanDescription) => `\xDAltima actualizaci\xF3n ${timeSpanDescription}`,
    fr: (timeSpanDescription) => `Derni\xE8re mise \xE0 jour ${timeSpanDescription}`,
    de: (timeSpanDescription) => `Zuletzt aktualisiert ${timeSpanDescription}`,
    it: (timeSpanDescription) => `Ultimo aggiornamento ${timeSpanDescription}`,
    ja: (timeSpanDescription) => `\u6700\u7D42\u66F4\u65B0 ${timeSpanDescription}`,
    ko: (timeSpanDescription) => `\uB9C8\uC9C0\uB9C9 \uC5C5\uB370\uC774\uD2B8 ${timeSpanDescription}`,
    pt: (timeSpanDescription) => `\xDAltima atualiza\xE7\xE3o ${timeSpanDescription}`,
    ru: (timeSpanDescription) =>
      `\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 ${timeSpanDescription}`,
    zh: (timeSpanDescription) => `\u6700\u540E\u66F4\u65B0 ${timeSpanDescription}`,
    hi: (timeSpanDescription) => `\u0905\u0902\u0924\u093F\u092E \u0905\u092A\u0921\u0947\u091F ${timeSpanDescription}`,
    ar: (timeSpanDescription) => `\u0622\u062E\u0631 \u062A\u062D\u062F\u064A\u062B ${timeSpanDescription}`,
  },
}
