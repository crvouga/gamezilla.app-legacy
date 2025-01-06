import type { ClientEvt } from '~/app/@/client/evt'
import { UserAccount } from '~/app/@/data/account'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'

type SpaceEvt =
  | {
      t: 'space-evt.user-left-space'
      spaceId: SpaceId
      userId: UserId
    }
  | {
      t: 'space-evt.user-joined-space'
      spaceId: SpaceId
      userId: UserId
    }
  | {
      t: 'space-evt.synced'
    }

type SpaceClientEvtBase = {
  currentUser?: UserAccount | null
}

export type SpaceClientEvt = SpaceClientEvtBase & (ClientEvt | SpaceEvt)

const toSpaceClientEvt = (evt?: SpaceClientEvt[] | null): SpaceClientEvt[] => {
  return (evt ?? []).flatMap((evt): SpaceEvt[] => {
    switch (evt.t) {
      case 'space-evt.user-joined-space':
      case 'space-evt.user-left-space':
      case 'space-evt.synced': {
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
      case 'space-evt.user-joined-space':
      case 'space-evt.user-left-space':
      case 'space-evt.synced': {
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
  toClientEvt,
}
