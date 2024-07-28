import { Err } from 'gamezilla-app/@/core'
import type { SocialLogin } from './social-login'

export const createSocialLogin = (): SocialLogin => {
  return {
    async getSocialLoginResult() {
      return Err('Failed to authenticate')
    },

    async redirectSocialLogin(_input) {
      return Err('Failed to authenticate')
    }
  }
}
