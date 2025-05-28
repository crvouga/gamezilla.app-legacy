import { withEventId } from '~/@/event-sourced/event'
import { Result } from '~/@/result'
import { Sub } from '~/@/sub'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { SpaceBackendModule } from '../architecture/space-backend'
import { Space } from '../core/space'
import { GamesBackend } from '../game/games/backend'
import type { MsgBackend } from '../types'
import { GamesBackendCtx } from './types'

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

  if (!spaceId) return {}

  const spaceState = Space.toSpaceStarted(Result.unwrapOr(await input.ctx.spacesCore.get(spaceId), null))

  if (!spaceState?.game) return {}

  const updated = await GamesBackend.update({
    deps: null,
    ctx: { ...input.ctx.games, space: spaceState },
    msg: input.msg?.t === 'game' ? input.msg.c : null,
    modelSpace: spaceState.game,
    msgFrontend:
      input.msgFrontend?.t === 'game' && input.msgFrontend.userId
        ? {
            ...input.msgFrontend,
            userId: input.msgFrontend.userId,

            ...input.msgFrontend.c,
          }
        : null,
    msgSpace: input.msgSpace?.t === 'game' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
  })

  return {
    // msgCmd: SpaceBackendCmd.map(updated.msgCmd, (c) => ({ t: 'game', c, spaceId })),
    msgSpace: updated.msgSpace?.map((e) => withEventId({ ...e, spaceId, t: 'game', c: e })),
  }
}

const inputToSpaceId = (input: Parameters<SpaceBackendModule['update']>[0]) => {
  if (input.msg && 'spaceId' in input.msg) {
    return input.msg.spaceId
  }

  if (input.msgFrontend && 'spaceId' in input.msgFrontend) {
    return input.msgFrontend.spaceId
  }

  if (input.msgSpace && 'spaceId' in input.msgSpace) {
    return input.msgSpace.spaceId
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
