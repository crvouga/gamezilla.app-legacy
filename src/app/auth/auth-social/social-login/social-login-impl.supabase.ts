import { Err } from '@/core'
import type { SocialLogin } from './social-login'

export const createSocialLogin = (): SocialLogin => {
  return {
    async getSocialLoginResult() {
      return Err('Failed to authenticate. Not implemented')
    },

    async redirectSocialLogin(_input) {
      return Err('Failed to authenticate. Not implemented')
    }
  }
}
