import { RPC } from '~/@/rpc'
import { TimeSpan } from '~/@/time/time-span'
import { Topic } from '~/@/topic'
import { AppBackendCtxBase } from '../@/backend/ctx'
import { SpaceId } from '../@/data/space-id'
import { GameBackend } from './game/backend'
import { ListSpacesBackend } from './list-spaces/backend'
import { Space } from './space/space'
import { SpacesDb } from './spaces/spaces-db'
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
    spacesDb: await SpacesDb({
      t: 'key-value-db',
      keyValueDb: input.ctx.keyValueDbDurable,
      logger: input.ctx.logger,
      runtime: input.ctx.runtime,
      writeThrottle: TimeSpan.seconds(10),
      namespace: [],
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
