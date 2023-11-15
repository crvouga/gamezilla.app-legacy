import { err } from "gamezilla/@SHARED/core";
import { SocialLogin } from "./social-login";

export const createSocialLogin = (): SocialLogin => {
  return {
    async getSocialLoginResult() {
      return err("Failed to authenticate. Not implemented");
    },

    async redirectSocialLogin({ provider }) {
      return err("Failed to authenticate. Not implemented");
    },
  };
};
