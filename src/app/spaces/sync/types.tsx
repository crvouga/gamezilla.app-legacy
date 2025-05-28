import { WithEventMeta } from '~/@/event-sourced/event'
import { s } from '~/@/schema'
import { WirePubSub } from '~/@/wire-pub-sub'
import { SpaceId } from '~/app/@/data/space-id'
import { UserAccount } from '~/app/@/data/user-account'
import { Space } from '../core/space'
import { MsgSpace } from '../core/space-msg/space-msg'

export type MsgToFrontend =
  | {
      t: 'sync.synced'
      space: Space.Model
      currentUser?: UserAccount | null
    }
  | {
      t: 'sync.got-msg-space'
      c: WithEventMeta<MsgSpace>
    }

export type MsgToBackend =
  | {
      t: 'sync.sync'
      space: Space.Model
    }
  | {
      t: 'sync.got-msg-space'
      c: WithEventMeta<MsgSpace>
    }

export const pubSubContract = WirePubSub.initContract({
  msgSpace: {
    params: s.obj({
      spaceId: SpaceId,
    }),
    msg: MsgSpace,
  },
})
