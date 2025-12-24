import type { Translations } from '~/@/l18n'

export type Text = {
  'game.numberlink.editing': string
  'game.numberlink.placing': (input: { position: 'first' | 'last' }) => string
}

export const translations: Translations<Text> = {
  'game.numberlink.editing': {
    en: 'Editing',
    es: 'Edición',
    fr: 'Édition',
    de: 'Bearbeiten',
    it: 'Modifica',
    ja: '編集',
    ko: '편집',
    pt: 'Edição',
    ru: 'редактирование',
    zh: '编辑',
    hi: 'संपादन',
    ar: 'تحرير',
  },
  'game.numberlink.placing': {
    en: ({ position }) => (position === 'first' ? 'Placing first' : 'Placing last'),
    es: ({ position }) => (position === 'first' ? 'Colocando primero' : 'Colocando \xFAltimo'),
    fr: ({ position }) => (position === 'first' ? 'Placement du premier' : 'Placement du dernier'),
    de: ({ position }) => (position === 'first' ? 'Platziere ersten' : 'Platziere letzten'),
    it: ({ position }) => (position === 'first' ? 'Posizionamento primo' : 'Posizionamento ultimo'),
    ja: ({ position }) => (position === 'first' ? '\u6700\u521D\u3092\u914D\u7F6E' : '\u6700\u5F8C\u3092\u914D\u7F6E'),
    ko: ({ position }) =>
      position === 'first' ? '\uCCAB \uBC88\uC9F8 \uBC30\uCE58' : '\uB9C8\uC9C0\uB9C9 \uBC30\uCE58',
    pt: ({ position }) => (position === 'first' ? 'Colocando primeiro' : 'Colocando \xFAltimo'),
    ru: ({ position }) =>
      position === 'first'
        ? '\u0420\u0430\u0437\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u043F\u0435\u0440\u0432\u043E\u0433\u043E'
        : '\u0420\u0430\u0437\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0433\u043E',
    zh: ({ position }) =>
      position === 'first' ? '\u653E\u7F6E\u7B2C\u4E00\u4E2A' : '\u653E\u7F6E\u6700\u540E\u4E00\u4E2A',
    hi: ({ position }) =>
      position === 'first'
        ? '\u092A\u0939\u0932\u093E \u0930\u0916 \u0930\u0939\u0947 \u0939\u0948\u0902'
        : '\u0905\u0902\u0924\u093F\u092E \u0930\u0916 \u0930\u0939\u0947 \u0939\u0948\u0902',
    ar: ({ position }) =>
      position === 'first'
        ? '\u0648\u0636\u0639 \u0627\u0644\u0623\u0648\u0644'
        : '\u0648\u0636\u0639 \u0627\u0644\u0623\u062E\u064A\u0631',
  },
}
