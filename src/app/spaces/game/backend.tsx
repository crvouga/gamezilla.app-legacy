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

const saga = function* () {
  yield fork(GamesBackend.saga)
}

export const GameBackend = {
  initCtx,
  saga,
}
