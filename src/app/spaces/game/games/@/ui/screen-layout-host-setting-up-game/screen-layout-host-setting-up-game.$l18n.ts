import type { Translations } from '~/@/l18n'

export type Text = {
  'game.host-is-setting-up-game': string
}

export const translations: Translations<Text> = {
  'game.host-is-setting-up-game': {
    en: 'Host is setting up the game',
    es: 'El anfitrión está configurando el juego',
    fr: "L'hôte configure la partie",
    de: 'Host richtet das Spiel ein',
    it: "L'host sta preparando il gioco",
    ja: 'ホストがゲームを設定中です',
    ko: '호스트가 게임을 설정하고 있습니다',
    pt: 'O anfitrião está configurando o jogo',
    ru: 'Хост настраивает игру',
    zh: '主持人正在设置游戏',
    hi: 'होस्ट गेम सेट कर रहा है',
    ar: 'المضيف يقوم بإعداد اللعبة',
  },
}
