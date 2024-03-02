import { err } from "gamezilla-app/@SHARED/core"
import { SocialLogin } from "./social-login"

export const createSocialLogin = (): SocialLogin => {
  return {
    async getSocialLoginResult() {
      return err("Failed to authenticate")
    },

    async redirectSocialLogin(_input) {
      return err("Failed to authenticate")
    },
  }
}
