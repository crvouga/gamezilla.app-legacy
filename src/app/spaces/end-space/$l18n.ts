import type { Translations } from '~/@/l18n'
import { Username } from '~/app/@/data/username'

export type Text = {
  'spaces.end': string
  'spaces.end-space': string
  'spaces.ended-space-host': string
  'spaces.ended-space-current-user': string
  'spaces.ended-space-other-user': (username: Username) => string
  'spaces.space-ended': string
}

export const translations: Translations<Text> = {
  'spaces.end': {
    en: 'End',
    es: 'Finalizar',
    fr: 'Fin',
    de: 'Ende',
    it: 'Fine',
    ja: '終了',
    ko: '종료',
    pt: 'Fim',
    ru: 'Конец',
    zh: '结束',
    hi: 'समाप्त',
    ar: 'نهاية',
  },
  'spaces.end-space': {
    en: 'End space',
    es: 'Finalizar espacio',
    fr: "Terminer l'espace",
    de: 'Raum beenden',
    it: 'Fine spazio',
    ja: 'スペースを終了',
    ko: '공간 종료',
    pt: 'Finalizar espaço',
    ru: 'Завершить пространство',
    zh: '结束空间',
    hi: 'स्थान समाप्त करें',
    ar: 'انهاء المساحة',
  },
  'spaces.ended-space-current-user': {
    en: 'Ended space',
    es: 'Espacio finalizado',
    fr: 'Espace terminé',
    de: 'Raum beendet',
    it: 'Spazio terminato',
    ja: 'スペースが終了しました',
    ko: '공간 종료됨',
    pt: 'Esp espaço finalizado',
    ru: 'Пространство завершено',
    zh: '空间已结束',
    hi: 'स्थान समाप्त',
    ar: 'انهاء المساحة',
  },
  'spaces.ended-space-host': {
    en: 'Space ended by host',
    es: 'Espacio finalizado por el anfitrión',
    fr: "Espace terminé par l'hôte",
    de: 'Raum beendet vom Gastgeber',
    it: "Spazio terminato dall'host",
    ja: 'ホストによってスペースが終了しました',
    ko: '공간 종료됨',
    pt: 'Espaço finalizado pelo anfitrião',
    ru: 'Пространство завершено хостом',
    zh: '空间已结束',
    hi: 'स्थान मेज़बान द्वारा समाप्त',
    ar: 'تم انهاء المساحة من قبل المضيف',
  },
  'spaces.ended-space-other-user': {
    en: (username) => `${username} ended space`,
    es: (username) => `${username} finaliz\xF3 espacio`,
    fr: (username) => `${username} a termin\xE9 l'espace`,
    de: (username) => `${username} Raum beendet`,
    it: (username) => `${username} ha terminato lo spazio`,
    ja: (username) => `${username} \u304C\u30B9\u30DA\u30FC\u30B9\u3092\u7D42\u4E86\u3057\u307E\u3057\u305F`,
    ko: (username) => `${username} \uACF5\uAC04 \uC885\uB8CC\uB428`,
    pt: (username) => `${username} finalizou espa\xE7o`,
    ru: (username) =>
      `${username} \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u043B \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u043E`,
    zh: (username) => `${username} \u5DF2\u7ED3\u675F\u7A7A\u95F4`,
    hi: (username) =>
      `${username} \u0928\u0947 \u0938\u094D\u0925\u093E\u0928 \u0938\u092E\u093E\u092A\u094D\u0924 \u0915\u093F\u092F\u093E`,
    ar: (username) => `${username} \u0627\u0646\u0647\u0627\u0621 \u0627\u0644\u0645\u0633\u0627\u062D\u0629`,
  },
  'spaces.space-ended': {
    en: 'Space ended',
    es: 'Espacio finalizado',
    fr: 'Espace terminé',
    de: 'Raum beendet',
    it: 'Spazio terminato',
    ja: 'スペースが終了しました',
    ko: '공간 종료됨',
    pt: 'Espaço finalizado',
    ru: 'Пространство завершено',
    zh: '空间已结束',
    hi: 'स्थान समाप्त',
    ar: 'تم انهاء المساحة',
  },
}
