import { isErr } from '~/@/result'
import { RPC } from '~/@/rpc'
import { BackendCtxModule } from '../types'
import { rpcContract } from './types'

const rpc = (config: { ctx: BackendCtxModule }) => {
  return RPC.initServer(rpcContract, {
    'spaces.list-spaces.list': async (_input, _reqCtx) => {
      const spaceProjections = await config.ctx.spaceProjectionDb.query({
        pagination: {
          limit: 1_000_000,
          offset: 0,
        },
      })

      if (isErr(spaceProjections)) {
        return { spaces: [] }
      }

      const spaces = await config.ctx.spaceDb.get(
        spaceProjections.value.items.flatMap((space) => (space.type === 'started' ? [space.spaceId] : [])),
      )

      if (isErr(spaces)) {
        return { spaces: [] }
      }

      return {
        spaces: spaces.value,
      }
    },
  })
}

export const ListSpacesBackend = {
  rpc,
}
