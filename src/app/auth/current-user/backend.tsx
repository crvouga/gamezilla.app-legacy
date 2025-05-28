import { RPC } from '~/@/wire-rpc'
import { BackendCtx } from '../@/backend/ctx'
import { rpcContract } from './types'

const rpc = (_input: { ctx: BackendCtx }) => {
  return RPC.initServer(rpcContract, {
    async getCurrentUser(_input, _reqCtx) {
      throw new Error('')
    },
  })
}

export const CurrentUserBackend = {
  rpc,
}
