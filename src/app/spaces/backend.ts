import { RPC } from '~/@/rpc'
import { Topic } from '~/@/topic'
import { AppBackendCtxBase } from '../@/backend/ctx'
import { GameBackend } from './game/backend'
import { ListSpacesBackend } from './list-spaces/backend'
import { SpaceProjectionDb } from './space/space-projection/space-projection-db'
import { SpaceDb } from './space/space/space-db'
import { SyncBackend } from './sync/backend'
import { type BackendCtxModule, rpcContract, topicContract } from './types'

const initCtx = async (input: {
  ctx: AppBackendCtxBase
  topic: Topic.Client<typeof topicContract>
}): Promise<BackendCtxModule> => {
  return {
    ...input.ctx,
    ...GameBackend.initCtx(input),
    topic: input.topic,
    spaceDb: await SpaceDb({
      t: 'key-value-db',
      keyValueDb: input.ctx.keyValueDbDurable,
      logger: input.ctx.logger,
      namespace: [],
    }),
    spaceProjectionDb: await SpaceProjectionDb({
      t: 'sql-db',
      sqlDb: input.ctx.postgres,
    }),
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
