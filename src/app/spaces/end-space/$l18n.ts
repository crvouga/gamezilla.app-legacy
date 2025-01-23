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
  en: {
    'spaces.end': 'End',
    'spaces.end-space': 'End space',
    'spaces.ended-space-host': 'Space ended by host',
    'spaces.ended-space-current-user': 'Ended space',
    'spaces.ended-space-other-user': (username) => `${username} ended space`,
    'spaces.space-ended': 'Space ended',
  },
  ar: {
    'spaces.end': 'نهاية',
    'spaces.end-space': 'انهاء المساحة',
    'spaces.ended-space-host': 'تم انهاء المساحة من قبل المضيف',
    'spaces.ended-space-current-user': 'انهاء المساحة',
    'spaces.ended-space-other-user': (username) => `${username} انهاء المساحة`,
    'spaces.space-ended': 'تم انهاء المساحة',
  },
  de: {
    'spaces.end': 'Ende',
    'spaces.end-space': 'Raum beenden',
    'spaces.ended-space-host': 'Raum beendet vom Gastgeber',
    'spaces.ended-space-current-user': 'Raum beendet',
    'spaces.ended-space-other-user': (username) => `${username} Raum beendet`,
    'spaces.space-ended': 'Raum beendet',
  },
  es: {
    'spaces.end': 'Finalizar',
    'spaces.end-space': 'Finalizar espacio',
    'spaces.ended-space-host': 'Espacio finalizado por el anfitrión',
    'spaces.ended-space-current-user': 'Espacio finalizado',
    'spaces.ended-space-other-user': (username) => `${username} finalizó espacio`,
    'spaces.space-ended': 'Espacio finalizado',
  },
  fr: {
    'spaces.end': 'Fin',
    'spaces.end-space': "Terminer l'espace",
    'spaces.ended-space-host': "Espace terminé par l'hôte",
    'spaces.ended-space-current-user': 'Espace terminé',
    'spaces.ended-space-other-user': (username) => `${username} a terminé l'espace`,
    'spaces.space-ended': 'Espace terminé',
  },
  hi: {
    'spaces.end': 'समाप्त',
    'spaces.end-space': 'स्थान समाप्त करें',
    'spaces.ended-space-host': 'स्थान मेज़बान द्वारा समाप्त',
    'spaces.ended-space-current-user': 'स्थान समाप्त',
    'spaces.ended-space-other-user': (username) => `${username} ने स्थान समाप्त किया`,
    'spaces.space-ended': 'स्थान समाप्त',
  },
  it: {
    'spaces.end': 'Fine',
    'spaces.end-space': 'Fine spazio',
    'spaces.ended-space-host': "Spazio terminato dall'host",
    'spaces.ended-space-current-user': 'Spazio terminato',
    'spaces.ended-space-other-user': (username) => `${username} ha terminato lo spazio`,
    'spaces.space-ended': 'Spazio terminato',
  },
  ja: {
    'spaces.end': '終了',
    'spaces.end-space': 'スペースを終了',
    'spaces.ended-space-host': 'ホストによってスペースが終了しました',
    'spaces.ended-space-current-user': 'スペースが終了しました',
    'spaces.ended-space-other-user': (username) => `${username} がスペースを終了しました`,
    'spaces.space-ended': 'スペースが終了しました',
  },
  ko: {
    'spaces.end': '종료',
    'spaces.end-space': '공간 종료',
    'spaces.ended-space-host': '공간 종료됨',
    'spaces.ended-space-current-user': '공간 종료됨',
    'spaces.ended-space-other-user': (username) => `${username} 공간 종료됨`,
    'spaces.space-ended': '공간 종료됨',
  },
  pt: {
    'spaces.end': 'Fim',
    'spaces.end-space': 'Finalizar espaço',
    'spaces.ended-space-host': 'Espaço finalizado pelo anfitrião',
    'spaces.ended-space-current-user': 'Esp espaço finalizado',
    'spaces.ended-space-other-user': (username) => `${username} finalizou espaço`,
    'spaces.space-ended': 'Espaço finalizado',
  },
  ru: {
    'spaces.end': 'Конец',
    'spaces.end-space': 'Завершить пространство',
    'spaces.ended-space-host': 'Пространство завершено хостом',
    'spaces.ended-space-current-user': 'Пространство завершено',
    'spaces.ended-space-other-user': (username) => `${username} завершил пространство`,
    'spaces.space-ended': 'Пространство завершено',
  },
  zh: {
    'spaces.end': '结束',
    'spaces.end-space': '结束空间',
    'spaces.ended-space-host': '空间已结束',
    'spaces.ended-space-current-user': '空间已结束',
    'spaces.ended-space-other-user': (username) => `${username} 已结束空间`,
    'spaces.space-ended': '空间已结束',
  },
}
