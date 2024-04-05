import { Translations } from "gamezilla-app/@SHARED/l18n"

export type Text = {
  "verify-sms.code-message": (code: string) => string
}

export const translations: Translations<Text> = {
  en: {
    "verify-sms.code-message": (code) => `Your verification code is ${code}`,
  },
  ar: {
    "verify-sms.code-message": (code) => `رمز التحقق الخاص بك هو ${code}`,
  },
  de: {
    "verify-sms.code-message": (code) => `Ihr Bestätigungscode lautet ${code}`,
  },
  es: {
    "verify-sms.code-message": (code) => `Su código de verificación es ${code}`,
  },
  fr: {
    "verify-sms.code-message": (code) =>
      `Votre code de vérification est ${code}`,
  },
  hi: {
    "verify-sms.code-message": (code) => `आपका सत्यापन कोड है ${code}`,
  },
  it: {
    "verify-sms.code-message": (code) => `Il tuo codice di verifica è ${code}`,
  },
  ja: {
    "verify-sms.code-message": (code) => `認証コードは${code}です`,
  },
  ko: {
    "verify-sms.code-message": (code) => `인증 코드는 ${code}입니다`,
  },
  pt: {
    "verify-sms.code-message": (code) => `Seu código de verificação é ${code}`,
  },
  ru: {
    "verify-sms.code-message": (code) => `Ваш код подтверждения - ${code}`,
  },
  zh: {
    "verify-sms.code-message": (code) => `您的验证码是${code}`,
  },
}
