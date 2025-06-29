import { describe, test } from '~/@/test-runner'
import { signUpWithEmailAndPassword } from './auth'
import { CustomAuthProvider } from './auth-custom'

const AuthProvider = CustomAuthProvider()

describe('Auth', () => {
  test('should sign up with email and password', async () => {
    await signUpWithEmailAndPassword(AuthProvider, {
      email: '',
      password: '',
    })
  })
})
