import { WithEventMeta } from '~/@/event-sourced/event'
import { Result } from '~/@/result'
import { RPC } from '~/@/rpc'
import { RPCError } from '~/@/rpc/error'
import { s } from '~/@/schema'
import { TopicContract } from '~/@/topic/topic-contract'
import { SpaceId } from '~/app/@/data/space-id'
import { MsgSpace } from '../space/msg-space'
import { Space } from '../space/space/space'

export type MsgFrontend =
  | {
      t: 'sync.got-msg-space'
      c: WithEventMeta<MsgSpace>
    }
  | {
      t: 'sync.synced'
      synced: Result<RPCError, { space: Space }>
    }

export type MsgBackend = {
  t: 'sync.got-msg-space'
  c: WithEventMeta<MsgSpace>
}

export const topicContract = TopicContract.init({
  'spaces/msg': {
    params: SpaceId,
    msg: WithEventMeta(MsgSpace),
  },
  'spaces/snapshot': {
    params: SpaceId,
    msg: Space.schema,
  },
})

export const rpcContract = RPC.initContract({
  'spaces.sync.sync': {
    input: s.obj({
      space: Space.schema,
    }),
    output: s.obj({
      space: Space.schema,
    }),
  },
})
