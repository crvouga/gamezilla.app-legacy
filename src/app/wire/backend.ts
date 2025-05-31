import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { AppBackendCtx } from '../@/backend/ctx'
import { BackendInstanceBackend } from './backend-instance/backend'
import { rpcContract, type BackendCtxModule, type MsgBackend } from './types'

const initCtx = async (input: { ctx: AppBackendCtx }): Promise<BackendCtxModule> => {
  return {
    ...input.ctx,
    backendInstance: await BackendInstanceBackend.initCtx({ ctx: input.ctx }),
  }
}

const update = async (input: {
  msgIn?: unknown
  msg?: MsgBackend | null
  ctx: BackendCtxModule
}): Promise<{ msgOut?: unknown[] }> => {
  const updated = await BackendInstanceBackend.update({
    ctx: input.ctx.backendInstance,
    msg: input.msg?.t === 'got-backend-instance-msg' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  return {
    msgOut: updated.msgOut,
  }
}

const subscriptions = async (_input: { ctx: BackendCtxModule }): Promise<Sub<MsgBackend>> => {
  return Sub.None
}

const rpc = (input: { ctx: BackendCtxModule }) => {
  return RPC.initServer(rpcContract, {
    backendInstance: BackendInstanceBackend.rpc({ ctx: input.ctx.backendInstance }),
  })
}

export const WireBackend = {
  initCtx,
  update,
  subscriptions,
  rpc,
}
