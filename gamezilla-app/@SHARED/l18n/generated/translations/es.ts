import { type Text } from '../text';
export const translations: Text = {
  "auth.current-user-logged-out": "Usuario",
"auth.current-user-logged-in": "Usuario",
"spaces.current-user-joined-space": "Espacio unido",
"spaces.other-user-joined-space": (username) => username ? `${username} unido al espacio` : "Espacio unido",
"spaces.space-not-found": "Espacio no encontrado",
"spaces.go-home": "Ir a casa",
"spaces.current-user-ended-space": "Espacio terminado",
"spaces.other-user-ended-space": (username) => username ? `${username} termin\xF3 el espacio` : "Espacio terminado"
};