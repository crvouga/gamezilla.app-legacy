import { RPC } from '~/@/rpc'
import { AuthBackendCtx } from '../@/backend/ctx'
import { rpcContract } from './types'

const rpc = (_input: { ctx: AuthBackendCtx }) => {
  return RPC.initServer(rpcContract, {
    'auth/current-user/get-current-user': async (_input, _reqCtx) => {
      throw new Error('')
    },
  })
}

export const CurrentUserBackend = {
  rpc,
}
