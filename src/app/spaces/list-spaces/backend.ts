import { isErr } from '~/@/result'
import { RPC } from '~/@/rpc'
import { Space } from '../core/space'
import { BackendCtxModule } from '../types'
import { rpcContract } from './types'

const rpc = (config: { ctx: BackendCtxModule }) => {
  return RPC.initServer(rpcContract, {
    async listSpaces(_input, _reqCtx) {
      const spaces = await config.ctx.spacesCoreA.list({
        pagination: {
          limit: 10000,
          offset: 0,
        },
      })

      if (isErr(spaces)) return { spaces: [] }

      const startedSpaces = spaces.value.items.filter((space) => Space.isStarted(space))

      return {
        spaces: startedSpaces,
      }
    },
  })
}

export const ListSpacesBackend = {
  rpc,
}
