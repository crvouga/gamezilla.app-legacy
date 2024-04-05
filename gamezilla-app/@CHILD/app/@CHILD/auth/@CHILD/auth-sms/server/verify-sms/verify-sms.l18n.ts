import { Translations } from "gamezilla-app/@SHARED/l18n"

export type Text = {
  "verifiy-sms.code-message": (code: string) => string
}

export const translations: Translations<Text> = {
  en: {
    "verifiy-sms.code-message": (code) => `Your verification code is ${code}`,
  },
  ar: {
    "verifiy-sms.code-message": (code) => `رمز التحقق الخاص بك هو ${code}`,
  },
  de: {
    "verifiy-sms.code-message": (code) => `Ihr Bestätigungscode lautet ${code}`,
  },
  es: {
    "verifiy-sms.code-message": (code) =>
      `Su código de verificación es ${code}`,
  },
  fr: {
    "verifiy-sms.code-message": (code) =>
      `Votre code de vérification est ${code}`,
  },
  hi: {
    "verifiy-sms.code-message": (code) => `आपका सत्यापन कोड है ${code}`,
  },
  it: {
    "verifiy-sms.code-message": (code) => `Il tuo codice di verifica è ${code}`,
  },
  ja: {
    "verifiy-sms.code-message": (code) => `認証コードは${code}です`,
  },
  ko: {
    "verifiy-sms.code-message": (code) => `인증 코드는 ${code}입니다`,
  },
  pt: {
    "verifiy-sms.code-message": (code) => `Seu código de verificação é ${code}`,
  },
  ru: {
    "verifiy-sms.code-message": (code) => `Ваш код подтверждения - ${code}`,
  },
  zh: {
    "verifiy-sms.code-message": (code) => `您的验证码是${code}`,
  },
}
