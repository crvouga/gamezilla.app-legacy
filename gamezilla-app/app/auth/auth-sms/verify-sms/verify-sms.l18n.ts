import { Translations } from "gamezilla-app/@shared/l18n"

export type Text = {
  "verify-sms.code-message": (code: string) => string
  "verify-sms-problem.code-incorrect": string
  "verify-sms-problem.verification-expired": string
  "verify-sms-problem.verification-not-found": string
  "verify-sms-problem.verification-already-verified": string
  "verify-sms-problem.database-error": string
  "verify-sms-problem.verification-expired-too-many-failed-attempts": string
}

export const translations: Translations<Text> = {
  en: {
    "verify-sms.code-message": (code) => `Your verification code is ${code}`,
    "verify-sms-problem.code-incorrect": "Code is incorrect",
    "verify-sms-problem.verification-expired": "Verification expired",
    "verify-sms-problem.verification-not-found": "Verification not found",
    "verify-sms-problem.verification-already-verified":
      "Verification already verified",
    "verify-sms-problem.database-error": "Database error",
    "verify-sms-problem.verification-expired-too-many-failed-attempts":
      "Verification expired due to too many failed attempts",
  },
  ar: {
    "verify-sms.code-message": (code) => `رمز التحقق الخاص بك هو ${code}`,
    "verify-sms-problem.code-incorrect": "الرمز غير صحيح",
    "verify-sms-problem.verification-expired": "انتهت صلاحية التحقق",
    "verify-sms-problem.verification-not-found": "لم يتم العثور على التحقق",
    "verify-sms-problem.verification-already-verified": "تم التحقق بالفعل",
    "verify-sms-problem.database-error": "خطأ في قاعدة البيانات",
    "verify-sms-problem.verification-expired-too-many-failed-attempts":
      "انتهت صلاحية التحقق بسبب عدد كبير من المحاولات الفاشلة",
  },
  de: {
    "verify-sms.code-message": (code) => `Ihr Bestätigungscode lautet ${code}`,
    "verify-sms-problem.code-incorrect": "Code ist falsch",
    "verify-sms-problem.verification-expired": "Verifizierung abgelaufen",
    "verify-sms-problem.verification-not-found": "Verifizierung nicht gefunden",
    "verify-sms-problem.verification-already-verified":
      "Verifizierung bereits bestätigt",
    "verify-sms-problem.database-error": "Datenbankfehler",
    "verify-sms-problem.verification-expired-too-many-failed-attempts":
      "Verifizierung abgelaufen aufgrund zu vieler fehlgeschlagener Versuche",
  },
  es: {
    "verify-sms.code-message": (code) => `Su código de verificación es ${code}`,
    "verify-sms-problem.code-incorrect": "El código es incorrecto",
    "verify-sms-problem.verification-expired": "Verificación caducada",
    "verify-sms-problem.verification-not-found": "Verificación no encontrada",
    "verify-sms-problem.verification-already-verified":
      "Verificación ya verificada",
    "verify-sms-problem.database-error": "Error de base de datos",
    "verify-sms-problem.verification-expired-too-many-failed-attempts":
      "Verificación caducada debido a demasiados intentos fallidos",
  },
  fr: {
    "verify-sms.code-message": (code) =>
      `Votre code de vérification est ${code}`,
    "verify-sms-problem.code-incorrect": "Le code est incorrect",
    "verify-sms-problem.verification-expired": "Vérification expirée",
    "verify-sms-problem.verification-not-found": "Vérification introuvable",
    "verify-sms-problem.verification-already-verified":
      "Vérification déjà vérifiée",
    "verify-sms-problem.database-error": "Erreur de base de données",
    "verify-sms-problem.verification-expired-too-many-failed-attempts":
      "Vérification expirée en raison de trop de tentatives échouées",
  },
  hi: {
    "verify-sms.code-message": (code) => `आपका सत्यापन कोड है ${code}`,
    "verify-sms-problem.code-incorrect": "कोड गलत है",
    "verify-sms-problem.verification-expired": "सत्यापन समाप्त हो गया",
    "verify-sms-problem.verification-not-found": "सत्यापन नहीं मिला",
    "verify-sms-problem.verification-already-verified":
      "सत्यापन पहले ही सत्यापित है",
    "verify-sms-problem.database-error": "डेटाबेस त्रुटि",
    "verify-sms-problem.verification-expired-too-many-failed-attempts":
      "बहुत सारे विफल प्रयासों के कारण सत्यापन समाप्त हो गया",
  },
  it: {
    "verify-sms.code-message": (code) => `Il tuo codice di verifica è ${code}`,
    "verify-sms-problem.code-incorrect": "Il codice è sbagliato",
    "verify-sms-problem.verification-expired": "Verifica scaduta",
    "verify-sms-problem.verification-not-found": "Verifica non trovata",
    "verify-sms-problem.verification-already-verified":
      "Verifica già verificata",
    "verify-sms-problem.database-error": "Errore del database",
    "verify-sms-problem.verification-expired-too-many-failed-attempts":
      "Verifica scaduta a causa di troppi tentativi falliti",
  },
  ja: {
    "verify-sms.code-message": (code) => `認証コードは${code}です`,
    "verify-sms-problem.code-incorrect": "コードが間違っています",
    "verify-sms-problem.verification-expired": "認証期限切れ",
    "verify-sms-problem.verification-not-found": "認証が見つかりません",
    "verify-sms-problem.verification-already-verified": "認証済み",
    "verify-sms-problem.database-error": "データベースエラー",
    "verify-sms-problem.verification-expired-too-many-failed-attempts":
      "多くの失敗した試行のため、認証が期限切れ",
  },
  ko: {
    "verify-sms.code-message": (code) => `인증 코드는 ${code}입니다`,
    "verify-sms-problem.code-incorrect": "코드가 잘못되었습니다",
    "verify-sms-problem.verification-expired": "인증 만료됨",
    "verify-sms-problem.verification-not-found": "인증을 찾을 수 없음",
    "verify-sms-problem.verification-already-verified": "이미 확인된 인증",
    "verify-sms-problem.database-error": "데이터베이스 오류",
    "verify-sms-problem.verification-expired-too-many-failed-attempts":
      "너무 많은 실패한 시도로 인한 인증 만료",
  },
  pt: {
    "verify-sms.code-message": (code) => `Seu código de verificação é ${code}`,
    "verify-sms-problem.code-incorrect": "O código está incorreto",
    "verify-sms-problem.verification-expired": "Verificação expirada",
    "verify-sms-problem.verification-not-found": "Verificação não encontrada",
    "verify-sms-problem.verification-already-verified":
      "Verificação já verificada",
    "verify-sms-problem.database-error": "Erro de banco de dados",
    "verify-sms-problem.verification-expired-too-many-failed-attempts":
      "Verificação expirada devido a muitas tentativas falhadas",
  },
  ru: {
    "verify-sms.code-message": (code) => `Ваш код подтверждения - ${code}`,
    "verify-sms-problem.code-incorrect": "Неверный код",
    "verify-sms-problem.database-error": "Ошибка базы данных",
    "verify-sms-problem.verification-already-verified":
      "Подтверждение уже подтверждено",
    "verify-sms-problem.verification-expired":
      "Истек срок действия подтверждения",
    "verify-sms-problem.verification-not-found": "Подтверждение не найдено",
    "verify-sms-problem.verification-expired-too-many-failed-attempts":
      "Истек срок действия подтверждения из-за слишком многих неудачных попыток",
  },
  zh: {
    "verify-sms.code-message": (code) => `您的验证码是${code}`,
    "verify-sms-problem.code-incorrect": "验证码错误",
    "verify-sms-problem.verification-expired": "验证已过期",
    "verify-sms-problem.verification-not-found": "找不到验证",
    "verify-sms-problem.verification-already-verified": "验证已经验证",
    "verify-sms-problem.database-error": "数据库错误",
    "verify-sms-problem.verification-expired-too-many-failed-attempts":
      "由于失败尝试过多，验证已过期",
  },
}
