import { signUpWithEmailAndPassword } from "./auth"
import { CustomAuthProvider } from "./auth-custom"

const AuthProvider = CustomAuthProvider()

const signedUp = await signUpWithEmailAndPassword(AuthProvider)({
  email: "",
  password: "",
})

if (signedUp.t === "err") {
  console.error(signedUp.error)
}
