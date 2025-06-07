import type { Translations } from '~/@/l18n'

export type Text = {
  'flow.editing': string
  'flow.placing': (input: { position: 'first' | 'last' }) => string
}

export const translations: Translations<Text> = {
  ar: {
    'flow.editing': 'تحرير',
    'flow.placing': ({ position }) => (position === 'first' ? 'وضع الأول' : 'وضع الأخير'),
  },
  de: {
    'flow.editing': 'Bearbeiten',
    'flow.placing': ({ position }) => (position === 'first' ? 'Platziere ersten' : 'Platziere letzten'),
  },
  en: {
    'flow.editing': 'Editing',
    'flow.placing': ({ position }) => (position === 'first' ? 'Placing first' : 'Placing last'),
  },
  es: {
    'flow.editing': 'Edición',
    'flow.placing': ({ position }) => (position === 'first' ? 'Colocando primero' : 'Colocando último'),
  },
  fr: {
    'flow.editing': 'Édition',
    'flow.placing': ({ position }) => (position === 'first' ? 'Placement du premier' : 'Placement du dernier'),
  },
  hi: {
    'flow.editing': 'संपादन',
    'flow.placing': ({ position }) => (position === 'first' ? 'पहला रख रहे हैं' : 'अंतिम रख रहे हैं'),
  },
  it: {
    'flow.editing': 'Modifica',
    'flow.placing': ({ position }) => (position === 'first' ? 'Posizionamento primo' : 'Posizionamento ultimo'),
  },
  ja: {
    'flow.editing': '編集',
    'flow.placing': ({ position }) => (position === 'first' ? '最初を配置' : '最後を配置'),
  },
  ko: {
    'flow.editing': '편집',
    'flow.placing': ({ position }) => (position === 'first' ? '첫 번째 배치' : '마지막 배치'),
  },
  pt: {
    'flow.editing': 'Edição',
    'flow.placing': ({ position }) => (position === 'first' ? 'Colocando primeiro' : 'Colocando último'),
  },
  ru: {
    'flow.editing': 'редактирование',
    'flow.placing': ({ position }) => (position === 'first' ? 'Размещение первого' : 'Размещение последнего'),
  },
  zh: {
    'flow.editing': '编辑',
    'flow.placing': ({ position }) => (position === 'first' ? '放置第一个' : '放置最后一个'),
  },
}
