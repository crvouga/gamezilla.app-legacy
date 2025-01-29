import type { AppFrontendEvt } from '~/app/@/frontend/evt'
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

type SpaceFrontendEvtBase = {
  currentUser?: UserAccount | null
}

export type SpaceFrontendEvt = SpaceFrontendEvtBase & (AppFrontendEvt | SpaceEvt)

const toSpaceFrontendEvt = (evt?: SpaceFrontendEvt[] | null): SpaceFrontendEvt[] => {
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

const toFrontendEvt = (evt?: SpaceFrontendEvt[] | null): AppFrontendEvt[] => {
  return (evt ?? []).flatMap((evt): AppFrontendEvt[] => {
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

export const SpaceFrontendEvt = {
  toSpaceFrontendEvt,
  toFrontendEvt,
}
