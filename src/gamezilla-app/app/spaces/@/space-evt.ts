import { SpaceId, UserId } from 'gamezilla-app/app/@/data'

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
