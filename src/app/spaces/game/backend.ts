import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { GamesBackend } from './games/backend'
import { GamesBackendCtxModule } from './types'

const initCtx = (input: { ctx: SpaceBackendCtx }): GamesBackendCtxModule => {
  const gameCtx = GamesBackend.initCtx(input)
  return {
    ...input.ctx,
    ...gameCtx,
  }
}

const worker = async (s: AbortSignal, input: { ctx: GamesBackendCtxModule }) => {
  GamesBackend.worker(s, input)
}

export const GameBackend = {
  initCtx,
  worker,
}
