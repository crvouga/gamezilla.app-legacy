import { SessionId } from "gamezilla/@CHILD/app/@SHARED/data";
import { EmailAddress } from "gamezilla/@SHARED/core";

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
