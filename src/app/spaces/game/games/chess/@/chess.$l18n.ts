import type { Translations } from '~/@/l18n'

export type Text = {
  'chess.puzzle-title': string
  'chess.puzzle-description': string
  'chess.white': string
  'chess.black': string
}

export const translations: Translations<Text> = {
  en: {
    'chess.puzzle-title': 'Puzzles',
    'chess.puzzle-description': 'Train with more than 3 million puzzles',
    'chess.black': 'Black',
    'chess.white': 'White',
  },
  ar: {
    'chess.puzzle-description': 'تدرب مع أكثر من 3 ملايين لغز',
    'chess.puzzle-title': 'ألغاز',
    'chess.black': 'أسود',
    'chess.white': 'أبيض',
  },
  de: {
    'chess.puzzle-description': 'Trainieren Sie mit mehr als 3 Millionen Rätseln',
    'chess.puzzle-title': 'Rätsel',
    'chess.black': 'Schwarz',
    'chess.white': 'Weiß',
  },
  es: {
    'chess.puzzle-description': 'Entrenar con más de 3 millones de rompecabezas',
    'chess.puzzle-title': 'Rompecabezas',
    'chess.white': 'Blanco',
    'chess.black': 'Black',
  },
  fr: {
    'chess.puzzle-description': 'Entraînez-vous avec plus de 3 millions de puzzles',
    'chess.puzzle-title': 'Puzzles',
    'chess.black': 'Noir',
    'chess.white': 'Blanc',
  },
  hi: {
    'chess.puzzle-description': '3 मिलियन से अधिक पहेलियों के साथ प्रशिक्षण करें',
    'chess.puzzle-title': 'पहेलियाँ',
    'chess.black': 'काला',
    'chess.white': 'सफेद',
  },
  it: {
    'chess.puzzle-description': 'Allenati con più di 3 milioni di puzzle',
    'chess.puzzle-title': 'Puzzle',
    'chess.black': 'Nero',
    'chess.white': 'Bianco',
  },
  ja: {
    'chess.puzzle-description': '300 万以上のパズルでトレーニング',
    'chess.puzzle-title': 'パズル',
    'chess.black': '黒',
    'chess.white': '白',
  },
  ko: {
    'chess.puzzle-description': '300 만 개 이상의 퍼즐로 훈련',
    'chess.puzzle-title': '퍼즐',
    'chess.black': '검은색',
    'chess.white': '흰색',
  },
  pt: {
    'chess.puzzle-description': 'Treine com mais de 3 milhões de quebra-cabeças',
    'chess.puzzle-title': 'Quebra-cabeças',
    'chess.black': 'Preto',
    'chess.white': 'Branco',
  },
  ru: {
    'chess.puzzle-description': 'Тренируйтесь с более чем 3 миллионами головоломок',
    'chess.puzzle-title': 'Головоломки',
    'chess.black': 'Черный',
    'chess.white': 'Белый',
  },
  zh: {
    'chess.puzzle-description': '使用300多万个拼图进行训练',
    'chess.puzzle-title': '拼图',
    'chess.black': '黑色',
    'chess.white': '白色',
  },
}
