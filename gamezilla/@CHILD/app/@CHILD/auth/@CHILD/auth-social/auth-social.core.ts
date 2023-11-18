import { SessionId } from "gamezilla/@CHILD/app/@SHARED/data";
import { EmailAddress, RemoteResult } from "gamezilla/@SHARED/core";

export type SocialLoginState =
  | {
      t: "in-progress";
      sessionId: SessionId;
    }
  | {
      t: "done";
      sessionId: SessionId;
      emailAddress: EmailAddress | null;
    };

type ClientMsg =
  | { t: "clicked-login-with-google" }
  | {
      t: "got-social-login-result";
      result: RemoteResult<string, EmailAddress>;
    };
