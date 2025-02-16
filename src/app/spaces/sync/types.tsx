import { WithEventMeta } from '~/@/event-sourced/event'
import { UserAccount } from '~/app/@/data/account'
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
