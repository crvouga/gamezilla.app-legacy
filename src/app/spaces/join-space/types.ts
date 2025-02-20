import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'

export type MsgFrontend =
  | { t: 'join-space.submitted-join-space-form'; spaceId: SpaceId }
  | { t: 'join-space.clicked-person-list-item'; userId: UserId }
  | { t: 'join-space.closed-person-item-surface' }
  | { t: 'join-space.opened-person-details'; userId: UserId }
