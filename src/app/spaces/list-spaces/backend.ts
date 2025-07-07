import { RPC } from '~/@/rpc'
import { BackendCtxModule } from '../types'
import { rpcContract } from './types'

const rpc = (_config: { ctx: BackendCtxModule }) => {
  return RPC.initServer(rpcContract, {
    'spaces.list-spaces.list': async (_input, _reqCtx) => {
      return { spaces: [] }
    },
  })
}

export const ListSpacesBackend = {
  rpc,
}
