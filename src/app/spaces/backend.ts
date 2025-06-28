import { RPC } from '~/@/rpc'
import { Topic } from '~/@/topic'
import { SYNC_REGISTRY } from '~/@/sync-engine/sync'
import { AppBackendCtxBase } from '../@/backend/ctx'
import { GameBackend } from './game/backend'
import { ListSpacesBackend } from './list-spaces/backend'
import { SpaceDb } from './space/space/space-db'
import { SyncBackend } from './sync/backend'
import { type BackendCtxModule, rpcContract, topicContract } from './types'
import { SpaceSync } from './space/space/space-sync'

const initCtx = async (input: {
  ctx: AppBackendCtxBase
  topic: Topic.Client<typeof topicContract>
}): Promise<BackendCtxModule> => {
  const spaceDb = await SpaceDb({
    t: 'sql-db',
    sqlDb: input.ctx.sqlDb,
    logger: input.ctx.logger,
  })

  SYNC_REGISTRY.add(SpaceSync({ spaceDb }))

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
    ...ListSpacesBackend.rpc(input),
  })
}

export const SpacesBackend = {
  initCtx,
  worker,
  rpc,
}
