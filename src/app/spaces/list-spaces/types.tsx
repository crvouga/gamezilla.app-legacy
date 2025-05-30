import { Pagination } from '~/@/query/query'
import { RPC } from '~/@/rpc'
import { s } from '~/@/schema'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '../core/space'

export type MsgFrontend = { t: 'list-spaces.clicked-space-card'; spaceId: SpaceId }

export const rpcContract = RPC.initContract({
  listSpaces: {
    input: s.obj({
      pagination: Pagination,
    }),
    output: s.obj({
      spaces: s.arr(Space.Model),
    }),
  },
})
