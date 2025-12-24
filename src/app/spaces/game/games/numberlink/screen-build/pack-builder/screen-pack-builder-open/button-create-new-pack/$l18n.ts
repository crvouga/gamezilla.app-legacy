import type { Translations } from '~/@/l18n'

export type Text = {
  'game.numberlink.pack-created': string
  'game.numberlink.create-pack': string
}

export const translations: Translations<Text> = {
  'game.numberlink.create-pack': {
    en: 'Create pack',
    es: 'Crear paquete',
    fr: 'Créer un pack',
    de: 'Packung erstellen',
    it: 'Crea pack',
    ja: 'パックを作成',
    ko: '팩 생성',
    pt: 'Criar pacote',
    ru: 'Создать пакет',
    zh: '创建包',
    hi: 'पैक बनाएं',
    ar: 'إنشاء حزمة',
  },
  'game.numberlink.pack-created': {
    en: 'Pack created',
    es: 'Paquete creado',
    fr: 'Pack créé',
    de: 'Packung erstellt',
    it: 'Pack creato',
    ja: 'パックが作成されました',
    ko: '팩이 생성되었습니다',
    pt: 'Pack criado',
    ru: 'Пакет создан',
    zh: '包已创建',
    hi: 'पैक बनाया गया',
    ar: 'تم إنشاء الحزمة',
  },
}
