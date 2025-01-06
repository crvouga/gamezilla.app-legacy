import { Result } from '~/@/result'
import { Polymorphic } from '../polymorphic-function'

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

signUpWithEmailAndPassword.implDefault(async () => Result.Err('Not implemented'))

export const logout = Polymorphic<(auth: AuthProvider) => Promise<Result<string, null>>>()

logout.implDefault(async () => Result.Err('Not implemented'))

export const loginWithEmailAndPassword = Polymorphic<
  (
    auth: AuthProvider,
    input: {
      email: string
      password: string
    },
  ) => Promise<Result<string, null>>
>()

loginWithEmailAndPassword.implDefault(async () => Result.Err('Not implemented'))

export const loginWithGoogle = Polymorphic<(auth: AuthProvider) => Promise<Result<string, null>>>()

loginWithGoogle.implDefault(async () => Result.Err('Not implemented'))
