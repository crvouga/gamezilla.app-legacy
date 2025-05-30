import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { Logger } from '../../@/logger'
import { AppBackendCtx } from '../@/backend/ctx'
import { BackendInstanceBackend } from './backend-instance/backend'
import { rpcContract, type BackendCtx, type MsgBackend } from './types'
import { WireSessionDb } from './wire-session-db'

const initCtx = async (input: { ctx: AppBackendCtx }): Promise<BackendCtx> => {
  const logger = Logger.prefix('wire', input.ctx.logger)
  return {
    ...input.ctx,
    backendInstance: await BackendInstanceBackend.initCtx({ ctx: input.ctx }),
    wireSessionDb: await WireSessionDb({
      t: 'cached-key-value-db',
      keyValueDb: input.ctx.keyValueDb,
      pubSubTopicBased: input.ctx.pubSub,
      logger,
    }),
  }
}

const update = async (input: {
  msgIn?: unknown
  msg?: MsgBackend | null
  ctx: BackendCtx
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

const subscriptions = async (_input: { ctx: BackendCtx }): Promise<Sub<MsgBackend>> => {
  return Sub.None
}

const rpc = (input: { ctx: BackendCtx }) => {
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
