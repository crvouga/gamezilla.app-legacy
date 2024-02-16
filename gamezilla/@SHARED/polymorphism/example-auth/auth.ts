import { Result } from "gamezilla/@SHARED/core"
import { definePolymorphicFunction } from "../polymorphic-function"

export type AuthProvider = {
  Auth: string
}

export const signUpWithEmailAndPassword = definePolymorphicFunction<
  AuthProvider,
  (input: { email: string; password: string }) => Promise<Result<string, null>>
>(() => async () => {
  return Result.err("Not implemented")
})

export const logout = definePolymorphicFunction<
  AuthProvider,
  () => Promise<Result<string, null>>
>(() => async () => {
  return Result.err("Not implemented")
})

export const loginWithEmailAndPassword = definePolymorphicFunction<
  AuthProvider,
  (input: { email: string; password: string }) => Promise<Result<string, null>>
>(() => async () => {
  return Result.err("Not implemented")
})

export const loginWithGoogle = definePolymorphicFunction<
  AuthProvider,
  () => Promise<Result<string, null>>
>(() => async () => {
  return Result.err("Not implemented")
})
