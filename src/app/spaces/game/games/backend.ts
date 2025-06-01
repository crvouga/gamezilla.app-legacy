import { fork } from 'typed-redux-saga'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { FlowBackend } from './flow/backend'
import type { GameBackendCtxModule } from './types'

const initCtx = (input: { ctx: SpaceBackendCtx }): GameBackendCtxModule => {
  return {
    ...input.ctx,
    ...FlowBackend.initCtx(input),
  }
}

const saga = function* (input: { ctx: GameBackendCtxModule }) {
  yield fork(FlowBackend.saga, input)
}

export const GamesBackend = {
  saga,
  initCtx,
}
