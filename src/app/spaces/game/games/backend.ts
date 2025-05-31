import { fork } from 'typed-redux-saga'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { FlowBackend } from './flow/backend'
import type { GameBackendCtx } from './types'

const initCtx = (input: { ctx: SpaceBackendCtx }): GameBackendCtx => {
  return {
    ...input.ctx,
    flow: FlowBackend.initCtx(input),
  }
}

const saga = function* (ctx: GameBackendCtx) {
  yield fork(FlowBackend.saga, ctx.flow)
  
}

export const GamesBackend = {
  saga,
  initCtx,
}
