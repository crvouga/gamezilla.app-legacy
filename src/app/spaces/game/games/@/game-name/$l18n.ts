import type { Translations } from '~/@/l18n'
import { GameName } from './game-name'

export type Text = {
  [gameName in GameName]: string
}

export const translations: Translations<Text> = {
  en: {
    'connect-four': 'Connect Four',
    numberlink: 'Numberlink',
    'tic-tac-toe': 'Tic Tac Toe',
    gomoku: 'Gomoku',
    chess: 'Chess',
  },
  ar: {
    'connect-four': 'ربط أربعة',
    numberlink: 'نمبرلينك',
    'tic-tac-toe': 'لعبة إكس أو',
    gomoku: 'جوموكو',
    chess: 'شطرنج',
  },
  de: {
    'connect-four': 'Vier gewinnt',
    numberlink: 'Numberlink',
    'tic-tac-toe': 'Tic Tac Toe',
    gomoku: 'Gomoku',
    chess: 'Schach',
  },
  es: {
    'connect-four': 'Conectar cuatro',
    numberlink: 'Numberlink',
    'tic-tac-toe': 'Tres en raya',
    gomoku: 'Gomoku',
    chess: 'Ajedrez',
  },
  fr: {
    'connect-four': 'Connectez Quatre',
    numberlink: 'Numberlink',
    'tic-tac-toe': 'Morpion',
    gomoku: 'Gomoku',
    chess: 'Échecs',
  },
  hi: {
    'connect-four': 'चार कनेक्ट करें',
    numberlink: 'नंबरलिंक',
    'tic-tac-toe': 'टिक टैक टो',
    gomoku: 'गोमोकु',
    chess: 'शतरंज',
  },
  it: {
    'connect-four': 'Collega Quattro',
    numberlink: 'Numberlink',
    'tic-tac-toe': 'Tris',
    gomoku: 'Gomoku',
    chess: 'Scacchi',
  },
  ja: {
    'connect-four': 'フォーをつなげる',
    numberlink: 'ナンバーリンク',
    'tic-tac-toe': '三目並べ',
    gomoku: '五目並べ',
    chess: 'チェス',
  },
  ko: {
    'connect-four': '네 개 연결',
    numberlink: '넘버링크',
    'tic-tac-toe': '틱택토',
    gomoku: '오목',
    chess: '체스',
  },
  pt: {
    'connect-four': 'Conectar Quatro',
    numberlink: 'Numberlink',
    'tic-tac-toe': 'Jogo da Velha',
    gomoku: 'Gomoku',
    chess: 'Xadrez',
  },
  ru: {
    'connect-four': 'Соедините четыре',
    numberlink: 'Намберлинк',
    'tic-tac-toe': 'Крестики-нолики',
    gomoku: 'Гомоку',
    chess: 'Шахматы',
  },
  zh: {
    'connect-four': '连接四',
    numberlink: '数字连接',
    'tic-tac-toe': '井字棋',
    gomoku: '五子棋',
    chess: '国际象棋',
  },
}
