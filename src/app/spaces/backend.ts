import { RPC } from '~/@/rpc'
import { ITopicClient } from '~/@/topic/topic-client/interface'
import { AppBackendCtxBase } from '../@/backend/ctx'
import { GameBackend } from './game/backend'
import { SpaceDb } from './space/space-db'
import { SpaceSync } from './space/space-sync'
import { SyncBackend } from './sync/backend'
import { type BackendCtxModule, rpcContract, topicContract } from './types'

const initCtx = async (input: {
  ctx: AppBackendCtxBase
  topic: ITopicClient<typeof topicContract>
}): Promise<BackendCtxModule> => {
  const spaceDb = SpaceDb.init({
    t: 'sql-db',
    sqlDb: input.ctx.sqlDb,
    logger: input.ctx.logger,
    migrationPolicy: input.ctx.migrationPolicy,
    kvDb: input.ctx.keyValueDbDurable,
  })

  input.ctx.syncEngine.registerSync(SpaceSync({ spaceDb }))

  return {
    ...input.ctx,
    ...GameBackend.initCtx(input),
    topic: input.topic,
    spaceDb,
  }
}

const worker = async (s: AbortSignal, input: { ctx: BackendCtxModule }) => {
  SyncBackend.worker(s, input)
  GameBackend.worker(s, input)
}

const rpc = (input: { ctx: BackendCtxModule }) => {
  return RPC.initServer(rpcContract, {
    ...SyncBackend.rpc(input),
  })
}

export const SpacesBackend = {
  initCtx,
  worker,
  rpc,
}
