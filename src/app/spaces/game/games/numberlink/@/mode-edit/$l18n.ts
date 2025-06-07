import type { Translations } from '~/@/l18n'

export type Text = {
  'game.numberlink.editing': string
  'game.numberlink.placing': (input: { position: 'first' | 'last' }) => string
}

export const translations: Translations<Text> = {
  ar: {
    'game.numberlink.editing': 'تحرير',
    'game.numberlink.placing': ({ position }) => (position === 'first' ? 'وضع الأول' : 'وضع الأخير'),
  },
  de: {
    'game.numberlink.editing': 'Bearbeiten',
    'game.numberlink.placing': ({ position }) => (position === 'first' ? 'Platziere ersten' : 'Platziere letzten'),
  },
  en: {
    'game.numberlink.editing': 'Editing',
    'game.numberlink.placing': ({ position }) => (position === 'first' ? 'Placing first' : 'Placing last'),
  },
  es: {
    'game.numberlink.editing': 'Edición',
    'game.numberlink.placing': ({ position }) => (position === 'first' ? 'Colocando primero' : 'Colocando último'),
  },
  fr: {
    'game.numberlink.editing': 'Édition',
    'game.numberlink.placing': ({ position }) =>
      position === 'first' ? 'Placement du premier' : 'Placement du dernier',
  },
  hi: {
    'game.numberlink.editing': 'संपादन',
    'game.numberlink.placing': ({ position }) => (position === 'first' ? 'पहला रख रहे हैं' : 'अंतिम रख रहे हैं'),
  },
  it: {
    'game.numberlink.editing': 'Modifica',
    'game.numberlink.placing': ({ position }) =>
      position === 'first' ? 'Posizionamento primo' : 'Posizionamento ultimo',
  },
  ja: {
    'game.numberlink.editing': '編集',
    'game.numberlink.placing': ({ position }) => (position === 'first' ? '最初を配置' : '最後を配置'),
  },
  ko: {
    'game.numberlink.editing': '편집',
    'game.numberlink.placing': ({ position }) => (position === 'first' ? '첫 번째 배치' : '마지막 배치'),
  },
  pt: {
    'game.numberlink.editing': 'Edição',
    'game.numberlink.placing': ({ position }) => (position === 'first' ? 'Colocando primeiro' : 'Colocando último'),
  },
  ru: {
    'game.numberlink.editing': 'редактирование',
    'game.numberlink.placing': ({ position }) =>
      position === 'first' ? 'Размещение первого' : 'Размещение последнего',
  },
  zh: {
    'game.numberlink.editing': '编辑',
    'game.numberlink.placing': ({ position }) => (position === 'first' ? '放置第一个' : '放置最后一个'),
  },
}
