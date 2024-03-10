import { type Text } from '../text';
export const translations: Text = {
  "auth.current-user-logged-out": "Utente",
"auth.current-user-logged-in": "Utente",
"spaces.current-user-joined-space": "Spazio unito",
"spaces.other-user-joined-space": (username) => username ? `${username} unito allo spazio` : "Spazio unito",
"spaces.space-not-found": "Spazio non trovato",
"spaces.go-home": "Torna a casa",
"spaces.current-user-ended-space": "Spazio terminato",
"spaces.other-user-ended-space": (username) => username ? `${username} ha terminato lo spazio` : "Spazio terminato"
};