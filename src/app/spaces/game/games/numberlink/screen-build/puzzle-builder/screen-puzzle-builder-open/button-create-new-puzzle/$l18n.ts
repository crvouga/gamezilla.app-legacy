import type { Translations } from '~/@/l18n'

export type Text = {
  'game.numberlink.create-new': string
  'game.numberlink.create-puzzle': string
  'game.numberlink.puzzle-created': string
}

export const translations: Translations<Text> = {
  'game.numberlink.create-new': {
    en: 'Create New',
    es: 'Crear nuevo',
    fr: 'Créer nouveau',
    de: 'Neu erstellen',
    it: 'Crea nuovo',
    ja: '新規作成',
    ko: '새로 만들기',
    pt: 'Criar novo',
    ru: 'Создать новый',
    zh: '创建新',
    hi: 'नया बनाएं',
    ar: 'إنشاء جديد',
  },
  'game.numberlink.create-puzzle': {
    en: 'Create Puzzle',
    es: 'Crear rompecabezas',
    fr: 'Créer un puzzle',
    de: 'Puzzle erstellen',
    it: 'Crea puzzle',
    ja: 'パズルを作成',
    ko: '퍼즐 만들기',
    pt: 'Criar quebra-cabeça',
    ru: 'Создать головоломку',
    zh: '创建拼图',
    hi: 'पहेली बनाएं',
    ar: 'إنشاء لغز',
  },
  'game.numberlink.puzzle-created': {
    en: 'Puzzle created',
    es: 'Rompecabezas creado',
    fr: 'Puzzle créé',
    de: 'Puzzle erstellt',
    it: 'Puzzle creato',
    ja: 'パズルが作成されました',
    ko: '퍼즐이 생성되었습니다',
    pt: 'Quebra-cabeça criado',
    ru: 'Головоломка создана',
    zh: '拼图已创建',
    hi: 'पहेली बनाई गई',
    ar: 'تم إنشاء اللغز',
  },
}
