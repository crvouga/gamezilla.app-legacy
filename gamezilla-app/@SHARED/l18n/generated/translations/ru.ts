import { type Text } from '../text';
export const translations: Text = {
  "auth.current-user-logged-out": "пользователь",
"auth.current-user-logged-in": "пользователь",
"spaces.current-user-joined-space": "Присоединился к пространству",
"spaces.other-user-joined-space": (username) => username ? `${username} \u043F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u0438\u043B\u0441\u044F \u043A \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u0443` : "\u041F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u0438\u043B\u0441\u044F \u043A \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u0443",
"spaces.space-not-found": "Пространство не найдено",
"spaces.go-home": "Иди домой",
"spaces.current-user-ended-space": "Пространство закончено",
"spaces.other-user-ended-space": (username) => username ? `${username} \u0437\u0430\u043A\u043E\u043D\u0447\u0438\u043B \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u043E` : "\u041F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u043E \u0437\u0430\u043A\u043E\u043D\u0447\u0435\u043D\u043E"
};