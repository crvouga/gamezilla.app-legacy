import { isErr } from '~/@/result'
import { RPC } from '~/@/rpc'
import { BackendCtxModule } from '../types'
import { rpcContract } from './types'

const rpc = (config: { ctx: BackendCtxModule }) => {
  return RPC.initServer(rpcContract, {
    'spaces.list-spaces.list': async (_input, _reqCtx) => {
      const spaces = await config.ctx.spaceDb.query({
        where: {},
      })

      if (isErr(spaces)) {
        return { spaces: [] }
      }

      return {
        spaces: spaces.value.items,
      }
    },
  })
}

export const ListSpacesBackend = {
  rpc,
}
