import { EmailAddress, RemoteResult, Result } from "gamezilla/@SHARED/core";

export type SocialLogin = {
  startSocialLogin: (input: {
    provider: "google";
  }) => Promise<Result<string, null>>;
  getSocialLoginResult: () => Promise<RemoteResult<string, EmailAddress>>;
};
