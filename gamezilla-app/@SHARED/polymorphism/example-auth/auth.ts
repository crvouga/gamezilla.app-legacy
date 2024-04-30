import { Result } from "gamezilla-app/@shared/core"
import { Polymorphic } from "../polymorphic-function"

export type AuthProvider = {
  Auth: string
}

export const signUpWithEmailAndPassword = Polymorphic<
  (
    auth: AuthProvider,
    input: {
      email: string
      password: string
    },
  ) => Promise<Result<string, null>>
>()

signUpWithEmailAndPassword.implementDefault(async () =>
  Result.Err("Not implemented"),
)

export const logout =
  Polymorphic<(auth: AuthProvider) => Promise<Result<string, null>>>()

logout.implementDefault(async () => Result.Err("Not implemented"))

export const loginWithEmailAndPassword = Polymorphic<
  (
    auth: AuthProvider,
    input: {
      email: string
      password: string
    },
  ) => Promise<Result<string, null>>
>()

loginWithEmailAndPassword.implementDefault(async () =>
  Result.Err("Not implemented"),
)

export const loginWithGoogle =
  Polymorphic<(auth: AuthProvider) => Promise<Result<string, null>>>()

loginWithGoogle.implementDefault(async () => Result.Err("Not implemented"))
