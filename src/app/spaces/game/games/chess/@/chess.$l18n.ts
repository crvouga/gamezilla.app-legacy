import type { Translations } from '~/@/l18n'

export type Text = {
  'chess.puzzle-title': string
  'chess.puzzle-description': string
  'chess.white': string
  'chess.black': string
}

export const translations: Translations<Text> = {
  'chess.black': {
    en: 'Black',
    es: 'Black',
    fr: 'Noir',
    de: 'Schwarz',
    it: 'Nero',
    ja: '黒',
    ko: '검은색',
    pt: 'Preto',
    ru: 'Черный',
    zh: '黑色',
    hi: 'काला',
    ar: 'أسود',
  },
  'chess.puzzle-description': {
    en: 'Train with more than 3 million puzzles',
    es: 'Entrenar con más de 3 millones de rompecabezas',
    fr: 'Entraînez-vous avec plus de 3 millions de puzzles',
    de: 'Trainieren Sie mit mehr als 3 Millionen Rätseln',
    it: 'Allenati con più di 3 milioni di puzzle',
    ja: '300 万以上のパズルでトレーニング',
    ko: '300 만 개 이상의 퍼즐로 훈련',
    pt: 'Treine com mais de 3 milhões de quebra-cabeças',
    ru: 'Тренируйтесь с более чем 3 миллионами головоломок',
    zh: '使用300多万个拼图进行训练',
    hi: '3 मिलियन से अधिक पहेलियों के साथ प्रशिक्षण करें',
    ar: 'تدرب مع أكثر من 3 ملايين لغز',
  },
  'chess.puzzle-title': {
    en: 'Puzzles',
    es: 'Rompecabezas',
    fr: 'Puzzles',
    de: 'Rätsel',
    it: 'Puzzle',
    ja: 'パズル',
    ko: '퍼즐',
    pt: 'Quebra-cabeças',
    ru: 'Головоломки',
    zh: '拼图',
    hi: 'पहेलियाँ',
    ar: 'ألغاز',
  },
  'chess.white': {
    en: 'White',
    es: 'Blanco',
    fr: 'Blanc',
    de: 'Weiß',
    it: 'Bianco',
    ja: '白',
    ko: '흰색',
    pt: 'Branco',
    ru: 'Белый',
    zh: '白色',
    hi: 'सफेद',
    ar: 'أبيض',
  },
}
