import { withEventId } from '~/@/event-sourced/event'
import { Result } from '~/@/result'
import { Sub } from '~/@/sub'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { SpaceBackendModule } from '../architecture/space-backend'
import { Space } from '../core/space'
import { GamesBackend } from '../game/games/backend'
import type { MsgBackend } from '../types'
import { GamesBackendCtx } from './types'
import { SpaceId } from '~/app/@/data/space-id'

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
    msg: null,
    modelSpace: spaceState.game,
    msgFrontend: null,
    msgSpace: input.msgSpace?.t === 'game' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
  })

  return {
    msgSpace: updated.msgSpace?.map((e) => withEventId({ ...e, spaceId, t: 'game', c: e })),
  }
}

const inputToSpaceId = (input: Parameters<SpaceBackendModule['update']>[0]): SpaceId | null => {
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
