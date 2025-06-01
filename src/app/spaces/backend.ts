import { fork } from 'typed-redux-saga'
import { RPC } from '~/@/rpc'
import { TimeSpan } from '~/@/time/time-span'
import { Topic } from '~/@/topic'
import { AppBackendCtxBase } from '../@/backend/ctx'
import { SpacesCoreAsync } from './core/core-async'
import { GameBackend } from './game/backend'
import { ListSpacesBackend } from './list-spaces/backend'
import { SyncBackend } from './sync/backend'
import { type BackendCtxModule, rpcContract, topicContract } from './types'

const initCtx = async (input: {
  ctx: AppBackendCtxBase
  topic: Topic.Client<typeof topicContract>
}): Promise<BackendCtxModule> => {
  return {
    ...input.ctx,
    topic: input.topic,
    games: GameBackend.initCtx({
      ctx: input.ctx,
    }),
    spacesCore: await SpacesCoreAsync({
      t: 'key-value-db',
      keyValueDb: input.ctx.keyValueDb,
      logger: input.ctx.logger,
      runtime: input.ctx.runtime,
      writeThrottle: TimeSpan.seconds(10),
      namespace: [],
    }),
  }
}

const saga = function* (ctx: BackendCtxModule) {
  yield fork(SyncBackend.saga, ctx)
  yield fork(GameBackend.saga, ctx.games)
}

const rpc = (input: { ctx: BackendCtxModule }) => {
  return RPC.initServer(rpcContract, {
    ...SyncBackend.rpc(input),
    ...ListSpacesBackend.rpc(input),
  })
}

export const SpacesBackend = {
  initCtx,
  saga,
  rpc,
}
