import type { SessionId } from 'gamezilla-app/app/@/data'
import type { EmailAddress } from '@/core'

export type SocialLoginState =
  | {
      t: 'in-progress'
      sessionId: SessionId
    }
  | {
      t: 'done'
      sessionId: SessionId
      emailAddress: EmailAddress | null
    }
