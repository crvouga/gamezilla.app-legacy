import type { Translations } from '~/@/l18n'

export type Text = {
  'game.numberlink.edit-mode': string
  'game.numberlink.play-mode': string
  'game.numberlink.playing': string
}

export const translations: Translations<Text> = {
  'game.numberlink.edit-mode': {
    en: 'Edit Mode',
    es: 'Modo de edición',
    fr: 'Mode édition',
    de: 'Bearbeitungsmodus',
    it: 'Modalità modifica',
    ja: '編集モード',
    ko: '편집 모드',
    pt: 'Modo de edição',
    ru: 'Режим редактирования',
    zh: '编辑模式',
    hi: 'संपादन मोड',
    ar: 'وضع التحرير',
  },
  'game.numberlink.play-mode': {
    en: 'Play Mode',
    es: 'Modo de juego',
    fr: 'Mode jeu',
    de: 'Spielmodus',
    it: 'Modalità gioco',
    ja: 'プレイモード',
    ko: '플레이 모드',
    pt: 'Modo de jogo',
    ru: 'Режим игры',
    zh: '游戏模式',
    hi: 'खेल मोड',
    ar: 'وضع اللعب',
  },
  'game.numberlink.playing': {
    en: 'Playing',
    es: 'Jugando',
    fr: 'Jouer',
    de: 'Spielen',
    it: 'Giocando',
    ja: 'プレイ中',
    ko: '플레이 중',
    pt: 'Jogando',
    ru: 'Игра',
    zh: '游戏中',
    hi: 'खेल रहे हैं',
    ar: 'اللعب',
  },
}
