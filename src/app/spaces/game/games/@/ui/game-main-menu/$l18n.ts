import type { Translations } from '~/@/l18n'

export type Text = {
  'game.play-friend-title': string
  'game.play-friend-description': string
  'game.play-computer-title': string
  'game.play-computer-description': string
}

export const translations: Translations<Text> = {
  'game.play-computer-description': {
    en: 'Play against a computer',
    es: 'Juega contra la computadora',
    fr: 'Jouez contre un ordinateur',
    de: 'Spiele gegen einen Computer',
    it: 'Gioca contro un computer',
    ja: 'コンピューターと対戦する',
    ko: '컴퓨터와 대결하다',
    pt: 'Jogue contra um computador',
    ru: 'Играть против компьютера',
    zh: '与电脑对战',
    hi: 'कंप्यूटर के खिलाफ खेलें',
    ar: 'العب ضد الكمبيوتر',
  },
  'game.play-computer-title': {
    en: 'Play Computer',
    es: 'Jugar con la computadora',
    fr: "Jouer avec l'ordinateur",
    de: 'Mit Computer spielen',
    it: 'Gioca con il computer',
    ja: 'コンピューターと遊ぶ',
    ko: '컴퓨터와 함께하기',
    pt: 'Jogar com computador',
    ru: 'Играть с компьютером',
    zh: '与电脑玩',
    hi: 'कंप्यूटर के साथ खेलें',
    ar: 'العب مع الكمبيوتر',
  },
  'game.play-friend-description': {
    en: 'Play against people in your space',
    es: 'Juega contra personas en tu espacio',
    fr: 'Jouez contre des personnes dans votre espace',
    de: 'Spiele gegen Leute in deinem Raum',
    it: 'Gioca contro le persone nel tuo spazio',
    ja: 'あなたのスペースの人々と対戦する',
    ko: '당신의 공간에서 사람들과 대결하다',
    pt: 'Jogue contra pessoas no seu espaço',
    ru: 'Играть против людей в вашем пространстве',
    zh: '与您的空间中的人对战',
    hi: 'अपने स्थान में लोगों के खिलाफ खेलें',
    ar: 'العب ضد أصدقائك في المكان',
  },
  'game.play-friend-title': {
    en: 'Play Friend',
    es: 'Jugar con amigo',
    fr: 'Jouer avec un ami',
    de: 'Mit Freund spielen',
    it: 'Gioca con un amico',
    ja: '友達と遊ぶ',
    ko: '친구와 함께하기',
    pt: 'Jogar com amigo',
    ru: 'Играть с другом',
    zh: '与朋友玩',
    hi: 'दोस्त के साथ खेलें',
    ar: 'العب مع صديق',
  },
}
