import { signUpWithEmailAndPassword } from "./auth"
import { CustomAuthProvider } from "./auth-custom"

const AuthProvider = CustomAuthProvider()

await signUpWithEmailAndPassword(AuthProvider)({
  email: "",
  password: "",
})
