import { Translations } from '~/@/l18n'

export type Text = {
  'app.something-went-wrong': string
}

export const translations: Translations<Text> = {
  'app.something-went-wrong': {
    en: 'Something went wrong',
    es: 'Algo salió mal',
    fr: "Quelque chose s'est mal passé",
    de: 'Etwas ist schief gelaufen',
    it: 'Qualcosa è andato storto',
    ja: '何かがうまくいかなかった',
    ko: '문제가 발생했습니다',
    pt: 'Algo deu errado',
    ru: 'Что-то пошло не так',
    zh: '出了点问题',
    hi: 'कुछ गलत हो गया',
    ar: 'حدث خطأ ما',
  },
}
