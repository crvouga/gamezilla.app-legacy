import { type Text } from '../text';
export const translations: Text = {
  "auth.current-user-logged-out": "Usuário",
"auth.current-user-logged-in": "Usuário",
"spaces.current-user-joined-space": "Espaço unido",
"spaces.other-user-joined-space": (username) => username ? `${username} unido ao espa\xE7o` : "Espa\xE7o unido",
"spaces.space-not-found": "Espaço não encontrado",
"spaces.go-home": "Ir para casa",
"spaces.current-user-ended-space": "Espaço terminado",
"spaces.other-user-ended-space": (username) => username ? `${username} terminou o espa\xE7o` : "Espa\xE7o terminado"
};