import { Eff, Result, Sub } from 'gamezilla-app/@/core'
import { SpaceServerCmd } from '../@/space-server-cmd'
import { SpaceServerModule } from '../architecture/space-server'
import { GameServer } from '../game/game.server'
import * as SpacesCoreServer from '../spaces-core/spaces-core.server'
import type { MsgServer } from '../spaces.types'

const update: SpaceServerModule['update'] = async (input) => {
  const spaceId = inputToSpaceId(input)

  if (!spaceId) {
    return { model: input.model }
  }

  const spaceState = await SpacesCoreServer.getSpaceStarted(input.deps.spaceCoreDb, spaceId)

  if (!spaceState?.game) {
    return { model: input.model }
  }

  const gameModel = Result.withDefault(await input.deps.gameDb.getBySpaceId(spaceId), null)

  const gameUpdated = await GameServer.update({
    deps: input.deps.gameServer,
    ctx: {
      ...input.ctx,
      ...input.deps.gameServer,
      space: spaceState
    },
    model: gameModel ?? GameServer.init(spaceState.game.t),
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
    msgCore:
      input.msgSpaceEvent?.t === 'game'
        ? {
            ...input.msgSpaceEvent,
            ...input.msgSpaceEvent.c
          }
        : null
  })

  return {
    model: input.model,
    eff: Eff.map(gameUpdated.eff, (c) => ({
      t: 'game',
      c,
      spaceId
    })),
    msgCmd: SpaceServerCmd.map(gameUpdated.msgCmd, (c) => ({
      t: 'game',
      c,
      spaceId
    })),
    msgSpaceEvent: gameUpdated.msgCore?.map((e) => ({
      ...e,
      spaceId,
      t: 'game',
      c: e
    }))
  }
}

const inputToSpaceId = (input: Parameters<SpaceServerModule['update']>[0]) => {
  if (input.msg && 'spaceId' in input.msg) {
    return input.msg.spaceId
  }

  if (input.msgClient && 'spaceId' in input.msgClient) {
    return input.msgClient.spaceId
  }

  if (input.msgSpaceEvent && 'spaceId' in input.msgSpaceEvent) {
    return input.msgSpaceEvent.spaceId
  }

  return null
}

const subscriptions: SpaceServerModule['subscriptions'] = async (_input) => {
  const batch: Sub<MsgServer>[] = []

  return Sub.batch(batch)
}

export const SpaceGameServer = {
  subscriptions,
  update
}
