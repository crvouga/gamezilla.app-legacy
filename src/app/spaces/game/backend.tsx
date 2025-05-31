import { fork } from 'typed-redux-saga'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { GamesBackend } from '../game/games/backend'
import { GamesBackendCtx } from './types'

const initCtx = (input: { ctx: SpaceBackendCtx }): GamesBackendCtx => {
  const gameCtx = GamesBackend.initCtx(input)
  return {
    ...input.ctx,
    ...gameCtx,
  }
}

const saga = function* (ctx: GamesBackendCtx) {
  yield fork(GamesBackend.saga, ctx)
}

export const GameBackend = {
  initCtx,
  saga,
}
