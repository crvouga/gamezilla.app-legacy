import { Result } from "gamezilla/@SHARED/core"
import { definePolymorphicFunction } from "../polymorphic-function"

export type AuthProvider = {
  Auth: string
}

export const signUpWithEmailAndPassword = definePolymorphicFunction<
  (
    auth: AuthProvider,
    input: {
      email: string
      password: string
    },
  ) => Promise<Result<string, null>>
>()

signUpWithEmailAndPassword.implementDefault(async () =>
  Result.err("Not implemented"),
)

export const logout =
  definePolymorphicFunction<
    (auth: AuthProvider) => Promise<Result<string, null>>
  >()

logout.implementDefault(async () => Result.err("Not implemented"))

export const loginWithEmailAndPassword = definePolymorphicFunction<
  (
    auth: AuthProvider,
    input: {
      email: string
      password: string
    },
  ) => Promise<Result<string, null>>
>()

loginWithEmailAndPassword.implementDefault(async () =>
  Result.err("Not implemented"),
)

export const loginWithGoogle =
  definePolymorphicFunction<
    (auth: AuthProvider) => Promise<Result<string, null>>
  >()

loginWithGoogle.implementDefault(async () => Result.err("Not implemented"))
