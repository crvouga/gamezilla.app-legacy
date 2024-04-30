import { SessionId } from "gamezilla-app/app/@shared/data"
import { EmailAddress } from "gamezilla-app/@shared/core"

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
