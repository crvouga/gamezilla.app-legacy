import { RPC } from '~/@/rpc'
import { ITopicClient } from '~/@/topic/topic-client/interface'
import { AppBackendCtxBase } from '../@/backend/ctx'
import { GameBackend } from './game/backend'
import { initSpaceDb, initSpaceProjectionDb, initSpaceProjectionUserDb } from './space/space-db'
import { SpaceSync } from './space/space-sync'
import { SyncBackend } from './sync/backend'
import { type BackendCtxModule, rpcContract, topicContract } from './types'

const initCtx = async (input: {
  ctx: AppBackendCtxBase
  topic: ITopicClient<typeof topicContract>
}): Promise<BackendCtxModule> => {
  const dbConfig = {
    t: 'sql-db' as const,
    sqlDb: input.ctx.sqlDb,
    logger: input.ctx.logger,
    migrationPolicy: input.ctx.migrationPolicy,
    kvDb: input.ctx.keyValueDbDurable,
  }
  const spaceDb = initSpaceDb(dbConfig)
  const spaceProjectionDb = initSpaceProjectionDb(dbConfig)
  const spaceProjectionUserDb = initSpaceProjectionUserDb(dbConfig)

  input.ctx.syncEngine.registerSync(SpaceSync({ spaceDb }))

  return {
    ...input.ctx,
    ...GameBackend.initCtx(input),
    topic: input.topic,
    spaceDb,
    spaceProjectionDb,
    spaceProjectionUserDb,
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
