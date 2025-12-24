import { WithEventId, WithEventMeta } from '~/@/event-sourced/event'
import { RPC } from '~/@/rpc'
import { s } from '~/@/schema'
import { Result } from '~/@/result'
import { RPCError } from '~/@/rpc/error'
import { TopicContract } from '~/@/topic/topic-contract'
import { SpaceId } from '~/app/@/data/space-id'
import { MsgSpace } from '../space/msg-space'
import { Space } from '../space/space'

export type Msg =
  | {
      t: 'sync_gotMsgSpaceFromBackend'
      c: WithEventMeta<MsgSpace>
    }
  | {
      t: 'sync_gotMsgSpaceFromFrontend'
      c: WithEventId<MsgSpace>
    }
  | {
      t: 'sync_synced'
      synced: Result<RPCError, { space: Space }>
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
