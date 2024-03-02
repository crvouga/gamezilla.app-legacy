import { SessionId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { EmailAddress } from "gamezilla-app/@SHARED/core"

export type SocialLoginState =
  | {
      t: "in-progress"
      sessionId: SessionId
    }
  | {
      t: "done"
      sessionId: SessionId
      emailAddress: EmailAddress | null
    }
