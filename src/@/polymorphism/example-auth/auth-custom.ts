import { Result } from '@/core'
import { type AuthProvider, signUpWithEmailAndPassword } from './auth'

type CustomAuthProvider = {
  Auth: 'custom'
}

const isCustomAuthProvider = (auth: AuthProvider): auth is CustomAuthProvider => auth.Auth === 'custom'

signUpWithEmailAndPassword.implement(isCustomAuthProvider, async (_auth, _input) => {
  return Result.Err('Not implemented')
})

export const CustomAuthProvider = (): CustomAuthProvider => ({
  Auth: 'custom'
})
