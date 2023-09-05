import { RemoteResult, Result } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";

export type Authenticator = {
  startSocialLogin: ({
    provider,
  }: {
    provider: "google";
  }) => Promise<Result<string, null>>;
  getSocialLoginResult: () => Promise<RemoteResult<string, UserId>>;
};
