import { RPC } from '~/@/rpc'
import { SpaceBackendCtxModule } from '../types'
import { rpcContract } from './types'
import { isErr } from '~/@/result'

const rpc = (config: { ctx: SpaceBackendCtxModule }) => {
  return RPC.initServer(rpcContract, {
    async listSpaces(input, _reqCtx) {
      const spaces = await config.ctx.spacesCore.list({
        pagination: input.pagination,
        whereAnd: {},
      })

      if (isErr(spaces)) return { spaces: [] }

      return { spaces: spaces.value.items }
    },
  })
}

export const ListSpacesBackend = {
  rpc,
}
