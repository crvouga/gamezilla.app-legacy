import { Err } from "gamezilla-app/@shared/core"
import { SocialLogin } from "./social-login"

export const createSocialLogin = (): SocialLogin => {
  return {
    async getSocialLoginResult() {
      return Err("Failed to authenticate. Not implemented")
    },

    async redirectSocialLogin(_input) {
      return Err("Failed to authenticate. Not implemented")
    },
  }
}
