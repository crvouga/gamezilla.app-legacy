import { EmailAddress, RemoteResult, Result } from "gamezilla/@SHARED/core";

export type SocialLogin = {
  /**
   * Redirects the user to the social login provider's website.
   */
  redirectSocialLogin: (input: {
    provider: "google";
  }) => Promise<Result<string, null>>;
  /**
   * Returns the result of the social login redirect.
   */
  getSocialLoginResult: () => Promise<RemoteResult<string, EmailAddress>>;
};
