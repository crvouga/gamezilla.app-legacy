import type { Translations } from '~/@/l18n'

export type Text = {
  'profile.update-profile': string
  'profile.update-avatar': string
  'profile.profile': string
  'profile-avatar.seed': string
}

export const translations: Translations<Text> = {
  'profile-avatar.seed': {
    en: 'Seed',
    es: 'Semilla',
    fr: 'Graine',
    de: 'Samen',
    it: 'Seme',
    ja: 'シード',
    ko: '씨앗',
    pt: 'Semente',
    ru: 'Семя',
    zh: '种子',
    hi: 'बीज',
    ar: 'بذرة',
  },
  'profile.profile': {
    en: 'Profile',
    es: 'Perfil',
    fr: 'Profil',
    de: 'Profil',
    it: 'Profilo',
    ja: 'プロフィール',
    ko: '프로필',
    pt: 'Perfil',
    ru: 'Профиль',
    zh: '个人资料',
    hi: 'प्रोफ़ाइल',
    ar: 'الملف الشخصي',
  },
  'profile.update-avatar': {
    en: 'Update Avatar',
    es: 'Actualizar avatar',
    fr: "Mettre à jour l'avatar",
    de: 'Avatar aktualisieren',
    it: 'Aggiorna avatar',
    ja: 'アバターを更新',
    ko: '아바타 업데이트',
    pt: 'Atualizar avatar',
    ru: 'Обновить аватар',
    zh: '更新头像',
    hi: 'अवतार अपडेट करें',
    ar: 'تحديث الصورة الرمزية',
  },
  'profile.update-profile': {
    en: 'Update Profile',
    es: 'Actualizar perfil',
    fr: 'Mettre à jour le profil',
    de: 'Profil aktualisieren',
    it: 'Aggiorna profilo',
    ja: 'プロフィールを更新',
    ko: '프로필 업데이트',
    pt: 'Atualizar perfil',
    ru: 'Обновить профиль',
    zh: '更新个人资料',
    hi: 'प्रोफ़ाइल अपडेट करें',
    ar: 'تحديث الملف الشخصي',
  },
}
