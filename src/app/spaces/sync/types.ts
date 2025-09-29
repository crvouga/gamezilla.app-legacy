import { WithEventMeta } from '~/@/event-sourced/event'
import { isAnyMsg } from '~/@/msg/msg'
import { Result } from '~/@/result'
import { RPC } from '~/@/rpc'
import { RPCError } from '~/@/rpc/error'
import { s } from '~/@/schema'
import { TopicContract } from '~/@/topic/topic-contract'
import { SpaceId } from '~/app/@/data/space-id'
import { MsgSpace } from '../space/msg-space'
import { Space } from '../space/space'

export type MsgFrontend =
  | {
      t: 'sync_gotMsgSpace'
      c: WithEventMeta<MsgSpace>
    }
  | {
      t: 'sync_synced'
      synced: Result<RPCError, { space: Space }>
    }

export const isMsgFrontend = (msg: unknown): msg is MsgFrontend => {
  return isAnyMsg(msg) && msg.t.startsWith('sync_')
}

export const topicContract = TopicContract.init({
  spaces_msg: {
    params: SpaceId,
    msg: WithEventMeta(MsgSpace),
  },
  spaces_snapshot: {
    params: SpaceId,
    msg: Space.schema,
  },
})

export const rpcContract = RPC.initContract({
  spaces_sync: {
    input: s.obj({
      space: Space.schema,
    }),
    output: s.obj({
      space: Space.schema,
    }),
  },
})
