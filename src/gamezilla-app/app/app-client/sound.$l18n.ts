import type { Translations } from '@/l18n'

export type Text = {
  'sound.sound-on': string
  'sound.sound-off': string
}

export const translations: Translations<Text> = {
  ar: {
    'sound.sound-off': 'الصوت معطل',
    'sound.sound-on': 'الصوت مفعل'
  },
  de: {
    'sound.sound-off': 'Ton aus',
    'sound.sound-on': 'Ton an'
  },
  en: {
    'sound.sound-off': 'Sound Off',
    'sound.sound-on': 'Sound On'
  },
  es: {
    'sound.sound-off': 'Sonido apagado',
    'sound.sound-on': 'Sonido encendido'
  },
  fr: {
    'sound.sound-off': 'Son désactivé',
    'sound.sound-on': 'Son activé'
  },
  hi: {
    'sound.sound-off': 'ध्वनि बंद',
    'sound.sound-on': 'ध्वनि चालू'
  },
  it: {
    'sound.sound-off': 'Suono spento',
    'sound.sound-on': 'Suono acceso'
  },
  ja: {
    'sound.sound-off': 'サウンドオフ',
    'sound.sound-on': 'サウンドオン'
  },
  ko: {
    'sound.sound-off': '소리 끄기',
    'sound.sound-on': '소리 켜기'
  },
  pt: {
    'sound.sound-off': 'Som desligado',
    'sound.sound-on': 'Som ligado'
  },
  ru: {
    'sound.sound-off': 'Звук выключен',
    'sound.sound-on': 'Звук включен'
  },
  zh: {
    'sound.sound-off': '关闭声音',
    'sound.sound-on': '打开声音'
  }
}
