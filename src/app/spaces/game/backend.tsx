import { fork } from 'typed-redux-saga'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { GamesBackend } from '../game/games/backend'
import { GamesBackendCtxModule } from './types'

const initCtx = (input: { ctx: SpaceBackendCtx }): GamesBackendCtxModule => {
  const gameCtx = GamesBackend.initCtx(input)
  return {
    ...input.ctx,
    ...gameCtx,
  }
}

const saga = function* (input: { ctx: GamesBackendCtxModule }) {
  yield fork(GamesBackend.saga, input)
}

export const GameBackend = {
  initCtx,
  saga,
}
