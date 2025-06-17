import { describe, it } from 'bun:test'
import { signUpWithEmailAndPassword } from './auth'
import { CustomAuthProvider } from './auth-custom'

const AuthProvider = CustomAuthProvider()

describe('Auth', () => {
  it('should sign up with email and password', async () => {
    await signUpWithEmailAndPassword(AuthProvider, {
      email: '',
      password: '',
    })
  })
})
