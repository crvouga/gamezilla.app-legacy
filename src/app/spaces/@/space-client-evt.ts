import type { ClientEvt } from '~/app/@/client'
import { UserId } from '~/app/@/data/user-id'
import { SpaceId } from '~/app/@/data/space-id'
import { UserAccount } from '~/app/@/data/account'

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

type SpaceClientEvtBase = {
  currentUser?: UserAccount | null
}

export type SpaceClientEvt = SpaceClientEvtBase & (ClientEvt | SpaceEvt)

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
