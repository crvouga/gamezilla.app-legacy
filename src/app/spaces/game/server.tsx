import { Result, Sub } from '~/@/core'
import { withEventId } from '~/@/event-sourced/event'
import { SpaceServerModule } from '../@/architecture/space-server'
import { SpaceServerCmd } from '../@/space-server-cmd'
import { SpaceServerCtx } from '../@/space-server-ctx'
import { SpaceCore } from '../core'
import { GamesServer } from '../games/server'
import type { MsgServer } from '../types'
import { GamesServerCtx } from './types'

const initCtx = (input: { ctx: SpaceServerCtx }): GamesServerCtx => {
  const gameCtx = GamesServer.initCtx(input)
  return {
    ...input.ctx,
    ...gameCtx
  }
}

const update: SpaceServerModule['update'] = async (input) => {
  return SpaceServerModule.andThen({}, () => updateGame(input))
}

const updateGame: SpaceServerModule['update'] = async (input) => {
  const spaceId = inputToSpaceId(input)

  if (!spaceId) {
    return {}
  }

  const spaceState = SpaceCore.toSpaceStarted(Result.unwrapOr(await input.ctx.spacesCoreServer.get(spaceId), null))

  if (!spaceState?.game) {
    return {}
  }

  const updated = await GamesServer.update({
    deps: null,
    ctx: { ...input.ctx.games, space: spaceState },
    msg: input.msg?.t === 'game' ? input.msg.c : null,
    modelCore: spaceState.game,
    msgClient:
      input.msgClient?.t === 'game' && input.msgClient.userId
        ? {
            ...input.msgClient,
            userId: input.msgClient.userId,
            ...input.msgClient.c
          }
        : null,
    msgEvt: input.msgEvt,
    msgCore: input.msgCore?.t === 'game' ? { ...input.msgCore, ...input.msgCore.c } : null
  })

  return {
    msgCmd: SpaceServerCmd.map(updated.msgCmd, (c) => ({ t: 'game', c, spaceId })),
    msgCore: updated.msgCore?.map((e) => withEventId({ ...e, spaceId, t: 'game', c: e }))
  }
}

const inputToSpaceId = (input: Parameters<SpaceServerModule['update']>[0]) => {
  if (input.msg && 'spaceId' in input.msg) {
    return input.msg.spaceId
  }

  if (input.msgClient && 'spaceId' in input.msgClient) {
    return input.msgClient.spaceId
  }

  if (input.msgCore && 'spaceId' in input.msgCore) {
    return input.msgCore.spaceId
  }

  return null
}

const subscriptions: SpaceServerModule['subscriptions'] = async (_input) => {
  const batch: Sub<MsgServer>[] = []

  return Sub.batch(batch)
}

export const GameServer = {
  initCtx,
  subscriptions,
  update
}
