import type { Translations } from '~/@/l18n'

export type Text = {
  'unsaved-changes.unsaved-changes-warning': string
}

export const translations: Translations<Text> = {
  'unsaved-changes.unsaved-changes-warning': {
    en: "Your changes will be lost if you don't save them before exiting.",
    es: 'Se perderán los cambios si no los guarda antes de salir.',
    fr: 'Vos modifications seront perdues si vous ne les enregistrez pas avant de quitter.',
    de: 'Ihre Änderungen gehen verloren, wenn Sie sie nicht vor dem Verlassen speichern.',
    it: 'Le tue modifiche andranno perse se non le salvi prima di uscire.',
    ja: '終了する前に保存しないと、変更が失われます。',
    ko: '저장하지 않으면 종료하기 전에 변경 사항이 손실됩니다.',
    pt: 'Suas alterações serão perdidas se você não salvá-las antes de sair.',
    ru: 'Ваши изменения будут потеряны, если вы не сохраните их перед выходом.',
    zh: '如果在退出之前不保存更改，您的更改将丢失。',
    hi: 'आपके परिवर्तन खो जाएंगे अगर आप उन्हें बाहर निकलने से पहले सहेजते नहीं हैं।',
    ar: 'سيتم فقدان تغييراتك إذا لم تقم بحفظها قبل الخروج.',
  },
}
