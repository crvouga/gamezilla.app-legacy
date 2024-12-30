import { UserId } from '~/app/@/data/user-id'
import { SpaceId } from '~/app/@/data/space-id'

export type SpaceEvt =
  | {
      t: 'space/user-left-space'
      spaceId: SpaceId
      userId: UserId
    }
  | {
      t: 'space/user-joined-space'
      spaceId: SpaceId
      userId: UserId
    }
