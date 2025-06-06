import { Pagination } from '~/@/query/query'
import { RemoteResult, Result } from '~/@/result'
import { RPC } from '~/@/rpc'
import { RPCError } from '~/@/rpc/error'
import { s } from '~/@/schema'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '../space/space'

export type ModelFrontend = {
  listSpacesRequest: RemoteResult<RPCError, unknown>
}

export type MsgFrontend =
  | { t: 'list-spaces.clicked-space-card'; spaceId: SpaceId }
  | { t: 'list-spaces.list-spaces-response'; spaces: Result<RPCError, { spaces: Space.Model[] }> }
  | { t: 'list-spaces.time-passed' }

export const rpcContract = RPC.initContract({
  'spaces.list-spaces.list': {
    input: s.obj({
      pagination: Pagination,
    }),
    output: s.obj({
      spaces: s.arr(Space.Model),
    }),
  },
})
