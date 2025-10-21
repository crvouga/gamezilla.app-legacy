import { UserId } from '~/app/@/data/user-id'
import { SpaceId } from '~/app/@/data/space-id'

export type SpaceEvt =
  | {
      t: 'space-evt.userLeftSpace'
      spaceId: SpaceId
      userId: UserId
    }
  | {
      t: 'space-evt.userJoinedSpace'
      spaceId: SpaceId
      userId: UserId
    }
