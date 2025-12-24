import type { Translations } from '~/@/l18n'

export type Text = {
  'auth-sms.phone-number': string
  'auth-sms.send-code': string
  'auth-sms.login-with-phone': string
  'auth-sms.country': string
  'auth-sms.code': string
  'auth-sms.verify-code': string
  'auth-sms.invalid-phone-number': string
  'auth-sms.enter-code-sent-to': (formattedPhoneNumber: string) => string
  'auth-sms.sent-code-to': (formattedPhoneNumber: string) => string
  'auth-sms.please-enter-code': string
}

export const translations: Translations<Text> = {
  'auth-sms.code': {
    en: 'Code',
    es: 'Código',
    fr: 'Code',
    de: 'Code',
    it: 'Codice',
    ja: 'コード',
    ko: '코드',
    pt: 'Código',
    ru: 'Код',
    zh: '代码',
    hi: 'कोड',
    ar: 'الرمز',
  },
  'auth-sms.country': {
    en: 'Country',
    es: 'País',
    fr: 'Pays',
    de: 'Land',
    it: 'Paese',
    ja: '国',
    ko: '국가',
    pt: 'País',
    ru: 'Страна',
    zh: '国家',
    hi: 'देश',
    ar: 'بلد',
  },
  'auth-sms.enter-code-sent-to': {
    en: (formattedPhoneNumber) => `Enter the code sent to ${formattedPhoneNumber}`,
    es: (formattedPhoneNumber) => `Introduce el c\xF3digo enviado a ${formattedPhoneNumber}`,
    fr: (formattedPhoneNumber) => `Entrez le code envoy\xE9 \xE0 ${formattedPhoneNumber}`,
    de: (formattedPhoneNumber) => `Code eingeben, der an ${formattedPhoneNumber} gesendet wurde`,
    it: (formattedPhoneNumber) => `Inserisci il codice inviato a ${formattedPhoneNumber}`,
    ja: (formattedPhoneNumber) =>
      `${formattedPhoneNumber} \u306B\u9001\u4FE1\u3055\u308C\u305F\u30B3\u30FC\u30C9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044`,
    ko: (formattedPhoneNumber) =>
      `${formattedPhoneNumber}\uB85C \uC804\uC1A1\uB41C \uCF54\uB4DC\uB97C \uC785\uB825\uD558\uC2ED\uC2DC\uC624`,
    pt: (formattedPhoneNumber) => `Insira o c\xF3digo enviado para ${formattedPhoneNumber}`,
    ru: (formattedPhoneNumber) =>
      `\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043E\u0434, \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043D\u044B\u0439 \u043D\u0430 ${formattedPhoneNumber}`,
    zh: (formattedPhoneNumber) => `\u8F93\u5165\u53D1\u9001\u5230 ${formattedPhoneNumber} \u7684\u4EE3\u7801`,
    hi: (formattedPhoneNumber) =>
      `\u0915\u094B\u0921 ${formattedPhoneNumber} \u092A\u0930 \u092D\u0947\u091C\u093E \u0917\u092F\u093E \u0939\u0948`,
    ar: (formattedPhoneNumber) =>
      `\u0623\u062F\u062E\u0644 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0645\u0631\u0633\u0644 \u0625\u0644\u0649 ${formattedPhoneNumber}`,
  },
  'auth-sms.invalid-phone-number': {
    en: 'Invalid phone number',
    es: 'Número de teléfono no válido',
    fr: 'Numéro de téléphone invalide',
    de: 'Ungültige Telefonnummer',
    it: 'Numero di telefono non valido',
    ja: '無効な電話番号',
    ko: '유효하지 않은 전화 번호',
    pt: 'Número de telefone inválido',
    ru: 'Неверный номер телефона',
    zh: '无效的电话号码',
    hi: 'अमान्य फोन नंबर',
    ar: 'رقم الهاتف غير صالح',
  },
  'auth-sms.login-with-phone': {
    en: 'Login with phone',
    es: 'Iniciar sesión con el teléfono',
    fr: 'Se connecter avec le téléphone',
    de: 'Mit Telefonnummer anmelden',
    it: 'Accedi con il telefono',
    ja: '電話でログイン',
    ko: '전화로 로그인',
    pt: 'Login com telefone',
    ru: 'Войти с телефона',
    zh: '使用电话登录',
    hi: 'फोन से लॉगिन करें',
    ar: 'تسجيل الدخول برقم الهاتف',
  },
  'auth-sms.phone-number': {
    en: 'Phone number',
    es: 'Número de teléfono',
    fr: 'Numéro de téléphone',
    de: 'Telefonnummer',
    it: 'Numero di telefono',
    ja: '電話番号',
    ko: '전화 번호',
    pt: 'Número de telefone',
    ru: 'Номер телефона',
    zh: '电话号码',
    hi: 'फ़ोन नंबर',
    ar: 'رقم الهاتف',
  },
  'auth-sms.please-enter-code': {
    en: 'Please enter the code',
    es: 'Por favor, introduzca el código',
    fr: 'Veuillez entrer le code',
    de: 'Bitte geben Sie den Code ein',
    it: 'Inserisci il codice',
    ja: 'コードを入力してください',
    ko: '코드를 입력하십시오',
    pt: 'Por favor, insira o código',
    ru: 'Пожалуйста, введите код',
    zh: '请输入代码',
    hi: 'कृपया कोड दर्ज करें',
    ar: 'الرجاء إدخال الرمز',
  },
  'auth-sms.send-code': {
    en: 'Send code',
    es: 'Enviar código',
    fr: 'Envoyer le code',
    de: 'Code senden',
    it: 'Invia codice',
    ja: 'コードを送信',
    ko: '코드 보내기',
    pt: 'Enviar código',
    ru: 'Отправить код',
    zh: '发送代码',
    hi: 'कोड भेजें',
    ar: 'إرسال الرمز',
  },
  'auth-sms.sent-code-to': {
    en: (formattedPhoneNumber) => `Sent code to ${formattedPhoneNumber}`,
    es: (formattedPhoneNumber) => `C\xF3digo enviado a ${formattedPhoneNumber}`,
    fr: (formattedPhoneNumber) => `Code envoy\xE9 \xE0 ${formattedPhoneNumber}`,
    de: (formattedPhoneNumber) => `Code an ${formattedPhoneNumber} gesendet`,
    it: (formattedPhoneNumber) => `Codice inviato a ${formattedPhoneNumber}`,
    ja: (formattedPhoneNumber) =>
      `${formattedPhoneNumber} \u306B\u30B3\u30FC\u30C9\u3092\u9001\u4FE1\u3057\u307E\u3057\u305F`,
    ko: (formattedPhoneNumber) => `${formattedPhoneNumber}\uB85C \uCF54\uB4DC\uB97C \uBCF4\uB0C8\uC2B5\uB2C8\uB2E4`,
    pt: (formattedPhoneNumber) => `C\xF3digo enviado para ${formattedPhoneNumber}`,
    ru: (formattedPhoneNumber) =>
      `\u041A\u043E\u0434 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D \u043D\u0430 ${formattedPhoneNumber}`,
    zh: (formattedPhoneNumber) => `\u5DF2\u53D1\u9001\u4EE3\u7801\u5230 ${formattedPhoneNumber}`,
    hi: (formattedPhoneNumber) =>
      `\u0915\u094B\u0921 ${formattedPhoneNumber} \u092A\u0930 \u092D\u0947\u091C\u093E \u0917\u092F\u093E`,
    ar: (formattedPhoneNumber) =>
      `\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0645\u0632 \u0625\u0644\u0649 ${formattedPhoneNumber}`,
  },
  'auth-sms.verify-code': {
    en: 'Verify code',
    es: 'Verificar código',
    fr: 'Vérifier le code',
    de: 'Code überprüfen',
    it: 'Verifica',
    ja: '確認',
    ko: '확인',
    pt: 'Verificar',
    ru: 'Проверить',
    zh: '验证',
    hi: 'सत्यापित करें',
    ar: 'التحقق من الرمز',
  },
}
