import type { Translations } from '~/@/l18n'
import { Username } from '~/app/@/data/username'

export type Text = {
  'spaces.join-space': string
  'spaces.current-userJoinedSpace': string
  'spaces.other-userJoinedSpace': (username: Username) => string
  "spaces.you're-already-in-a-space": string
  'spaces.space': string
}

export const translations: Translations<Text> = {
  'spaces.current-userJoinedSpace': {
    en: 'Joined space',
    es: 'Unido al espacio',
    fr: 'Espace rejoint',
    de: 'Raum beigetreten',
    it: 'Spazio unito',
    ja: 'スペースに参加しました',
    ko: '공간에 참여함',
    pt: 'Juntou-se ao espaço',
    ru: 'Присоединился к пространству',
    zh: '加入空间',
    hi: 'स्थान जुड़ गया',
    ar: 'انضمت إلى المساحة',
  },
  'spaces.join-space': {
    en: 'Join space',
    es: 'Unirse al espacio',
    fr: "Rejoindre l'espace",
    de: 'Raum beitreten',
    it: 'Unisciti allo spazio',
    ja: 'スペースに参加',
    ko: '공간에 참여',
    pt: 'Junte-se ao espaço',
    ru: 'Присоединиться к пространству',
    zh: '加入空间',
    hi: 'स्थान जोड़ें',
    ar: 'انضم إلى المساحة',
  },
  'spaces.other-userJoinedSpace': {
    en: (username) => `${username} joined space`,
    es: (username) => `${username} se uni\xF3 al espacio`,
    fr: (username) => `${username} a rejoint l'espace`,
    de: (username) => `${username} ist dem Raum beigetreten`,
    it: (username) => `${username} si \xE8 unito allo spazio`,
    ja: (username) => `${username} \u304C\u30B9\u30DA\u30FC\u30B9\u306B\u53C2\u52A0\u3057\u307E\u3057\u305F`,
    ko: (username) => `${username} \uAC00 \uACF5\uAC04\uC5D0 \uCC38\uC5EC\uD568`,
    pt: (username) => `${username} juntou-se ao espa\xE7o`,
    ru: (username) =>
      `${username} \u043F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u0438\u043B\u0441\u044F \u043A \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u0443`,
    zh: (username) => `${username} \u52A0\u5165\u4E86\u7A7A\u95F4`,
    hi: (username) => `${username} \u0928\u0947 \u0938\u094D\u0925\u093E\u0928 \u091C\u094B\u0921\u093C\u093E`,
    ar: (username) =>
      `${username} \u0627\u0646\u0636\u0645 \u0625\u0644\u0649 \u0627\u0644\u0645\u0633\u0627\u062D\u0629`,
  },
  'spaces.space': {
    en: 'Space',
    es: 'Espacio',
    fr: 'Espace',
    de: 'Raum',
    it: 'Spazio',
    ja: 'スペース',
    ko: '공간',
    pt: 'Espaço',
    ru: 'Пространство',
    zh: '空间',
    hi: 'स्थान',
    ar: 'الفضاء',
  },
  "spaces.you're-already-in-a-space": {
    en: "You're already in a space",
    es: 'Ya estás en un espacio',
    fr: 'Vous êtes déjà dans un espace',
    de: 'Du bist bereits in einem Raum',
    it: 'Sei già in uno spazio',
    ja: 'すでにスペースにいます',
    ko: '이미 공간에 있습니다',
    pt: 'Você já está em um espaço',
    ru: 'Вы уже находитесь в пространстве',
    zh: '您已经在一个空间中',
    hi: 'आप पहले से ही एक स्थान में हैं',
    ar: 'أنت بالفعل في مساحة',
  },
}
