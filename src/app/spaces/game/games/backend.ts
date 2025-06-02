import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { FlowBackend } from './flow/backend'
import type { GameBackendCtxModule } from './types'

const initCtx = (input: { ctx: SpaceBackendCtx }): GameBackendCtxModule => {
  return {
    ...input.ctx,
    ...FlowBackend.initCtx(input),
  }
}

const worker = async (s: AbortSignal, input: { ctx: GameBackendCtxModule }) => {
  FlowBackend.worker(s, input)
}

export const GamesBackend = {
  worker,
  initCtx,
}
