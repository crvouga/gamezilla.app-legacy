import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { NumberlinkBackend } from './numberlink/backend'
import type { GameBackendCtxModule } from './types'

const initCtx = (input: { ctx: SpaceBackendCtx }): GameBackendCtxModule => {
  return {
    ...input.ctx,
    ...NumberlinkBackend.initCtx(input),
  }
}

const worker = async (s: AbortSignal, input: { ctx: GameBackendCtxModule }) => {
  NumberlinkBackend.worker(s, input)
}

export const GamesBackend = {
  worker,
  initCtx,
}
