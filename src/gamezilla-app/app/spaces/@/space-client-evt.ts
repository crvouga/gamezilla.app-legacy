import type { ClientEvt } from 'gamezilla-app/app/@/client'
import { SpaceId, UserId } from 'gamezilla-app/app/@/data'

type SpaceEvt =
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
  | {
      t: 'space/synced'
    }

export type SpaceClientEvt = ClientEvt | SpaceEvt

const toSpaceClientEvt = (evt?: SpaceClientEvt[] | null): SpaceClientEvt[] => {
  return (evt ?? []).flatMap((evt): SpaceEvt[] => {
    switch (evt.t) {
      case 'space/user-joined-space':
      case 'space/user-left-space':
      case 'space/synced': {
        return [evt]
      }
      default: {
        return []
      }
    }
  })
}

const toClientEvt = (evt?: SpaceClientEvt[] | null): ClientEvt[] => {
  return (evt ?? []).flatMap((evt): ClientEvt[] => {
    switch (evt.t) {
      case 'space/user-joined-space':
      case 'space/user-left-space':
      case 'space/synced': {
        return []
      }
      default: {
        return [evt]
      }
    }
  })
}

export const SpaceClientEvt = {
  toSpaceClientEvt,
  toClientEvt
}
