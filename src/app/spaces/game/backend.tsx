import { Result } from '~/@/result'
import { withEventId } from '~/@/event-sourced/event'
import { SpaceBackendModule } from '../@/architecture/space-backend'
import { SpaceBackendCmd } from '~/app/spaces/@/space-backend/cmd'
import { SpaceBackendCtx } from '~/app/spaces/@/space-backend/ctx'
import { SpaceCore } from '../core/space-core'
import { GamesBackend } from '../game/games/backend'
import type { MsgBackend } from '../types'
import { GamesBackendCtx } from './types'
import { Sub } from '~/@/sub'

const initCtx = (input: { ctx: SpaceBackendCtx }): GamesBackendCtx => {
  const gameCtx = GamesBackend.initCtx(input)
  return {
    ...input.ctx,
    ...gameCtx,
  }
}

const update: SpaceBackendModule['update'] = async (input) => {
  return SpaceBackendModule.andThen({}, () => updateGame(input))
}

const updateGame: SpaceBackendModule['update'] = async (input) => {
  const spaceId = inputToSpaceId(input)

  if (!spaceId) {
    return {}
  }

  const spaceState = SpaceCore.toSpaceStarted(Result.unwrapOr(await input.ctx.spacesCoreBackend.get(spaceId), null))

  if (!spaceState?.game) {
    return {}
  }

  const updated = await GamesBackend.update({
    deps: null,
    ctx: { ...input.ctx.games, space: spaceState },
    msg: input.msg?.t === 'game' ? input.msg.c : null,
    modelCore: spaceState.game,
    msgFrontend:
      input.msgFrontend?.t === 'game' && input.msgFrontend.userId
        ? {
            ...input.msgFrontend,
            userId: input.msgFrontend.userId,
            ...input.msgFrontend.c,
          }
        : null,
    msgEvt: input.msgEvt,
    msgCore: input.msgCore?.t === 'game' ? { ...input.msgCore, ...input.msgCore.c } : null,
  })

  return {
    msgCmd: SpaceBackendCmd.map(updated.msgCmd, (c) => ({ t: 'game', c, spaceId })),
    msgCore: updated.msgCore?.map((e) => withEventId({ ...e, spaceId, t: 'game', c: e })),
  }
}

const inputToSpaceId = (input: Parameters<SpaceBackendModule['update']>[0]) => {
  if (input.msg && 'spaceId' in input.msg) {
    return input.msg.spaceId
  }

  if (input.msgFrontend && 'spaceId' in input.msgFrontend) {
    return input.msgFrontend.spaceId
  }

  if (input.msgCore && 'spaceId' in input.msgCore) {
    return input.msgCore.spaceId
  }

  return null
}

const subscriptions: SpaceBackendModule['subscriptions'] = async (_input) => {
  const batch: Sub<MsgBackend>[] = []

  return Sub.batch(batch)
}

export const GameBackend = {
  initCtx,
  subscriptions,
  update,
}
