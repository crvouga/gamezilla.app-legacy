import type { Translations } from '~/@/l18n'

export type Text = {
  'unsaved-changes.unsaved-changes-warning': string
}

export const translations: Translations<Text> = {
  en: {
    'unsaved-changes.unsaved-changes-warning': `Your changes will be lost if you don't save them before exiting.`,
  },
  ar: {
    'unsaved-changes.unsaved-changes-warning': `سيتم فقدان تغييراتك إذا لم تقم بحفظها قبل الخروج.`,
  },
  de: {
    'unsaved-changes.unsaved-changes-warning': `Ihre Änderungen gehen verloren, wenn Sie sie nicht vor dem Verlassen speichern.`,
  },
  es: {
    'unsaved-changes.unsaved-changes-warning': `Se perderán los cambios si no los guarda antes de salir.`,
  },
  fr: {
    'unsaved-changes.unsaved-changes-warning': `Vos modifications seront perdues si vous ne les enregistrez pas avant de quitter.`,
  },
  it: {
    'unsaved-changes.unsaved-changes-warning': `Le tue modifiche andranno perse se non le salvi prima di uscire.`,
  },
  ja: {
    'unsaved-changes.unsaved-changes-warning': `終了する前に保存しないと、変更が失われます。`,
  },
  ko: {
    'unsaved-changes.unsaved-changes-warning': `저장하지 않으면 종료하기 전에 변경 사항이 손실됩니다.`,
  },
  pt: {
    'unsaved-changes.unsaved-changes-warning': `Suas alterações serão perdidas se você não salvá-las antes de sair.`,
  },
  ru: {
    'unsaved-changes.unsaved-changes-warning': `Ваши изменения будут потеряны, если вы не сохраните их перед выходом.`,
  },
  zh: {
    'unsaved-changes.unsaved-changes-warning': `如果在退出之前不保存更改，您的更改将丢失。`,
  },
  hi: {
    'unsaved-changes.unsaved-changes-warning': `आपके परिवर्तन खो जाएंगे अगर आप उन्हें बाहर निकलने से पहले सहेजते नहीं हैं।`,
  },
}
