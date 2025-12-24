import type { Translations } from '~/@/l18n'

export type Text = {
  'auth.continue-as-guest.errored': string
}

export const translations: Translations<Text> = {
  'auth.continue-as-guest.errored': {
    en: 'An error occurred while attempting',
    es: 'Se produjo un error al intentar',
    fr: "Une erreur s'est produite lors de la tentative",
    de: 'Ein Fehler ist aufgetreten',
    it: 'Si è verificato un errore durante il tentativo',
    ja: '試行中にエラーが発生しました',
    ko: '시도하는 동안 오류가 발생했습니다',
    pt: 'Ocorreu um erro ao tentar',
    ru: 'Произошла ошибка при попытке',
    zh: '尝试时发生错误',
    hi: 'कोशिश करते समय एक त्रुटि आई',
    ar: 'حدث خطأ أثناء المحاولة',
  },
}
