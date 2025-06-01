import { WithEventMeta } from '~/@/event-sourced/event'
import { Result } from '~/@/result'
import { RPC } from '~/@/rpc'
import { RPCError } from '~/@/rpc/error'
import { s } from '~/@/schema'
import { Topic } from '~/@/topic'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '../core/space'
import { MsgSpace } from '../core/space-msg/space-msg'

export type MsgFrontend =
  | {
      t: 'sync.got-msg-space'
      c: WithEventMeta<MsgSpace>
    }
  | {
      t: 'sync.synced'
      synced: Result<RPCError, { space: Space.Model }>
    }

export type MsgBackend = {
  t: 'sync.got-msg-space'
  c: WithEventMeta<MsgSpace>
}

export const topicContract = Topic.initContract({
  'spaces.sync.msg-space': {
    params: SpaceId,
    msg: WithEventMeta(MsgSpace),
  },
  'spaces.sync.msg-space-all': {
    params: s.l(null),
    msg: WithEventMeta(MsgSpace),
  },
})

export const rpcContract = RPC.initContract({
  'spaces.sync.sync': {
    input: s.obj({
      space: Space.Model,
    }),
    output: s.obj({
      space: Space.Model,
    }),
  },
})
