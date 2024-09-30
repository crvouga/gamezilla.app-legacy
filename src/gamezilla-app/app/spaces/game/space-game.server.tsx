import { Sub } from 'gamezilla-app/@/core'
import { SpaceServerCmd } from '../@/space-server-cmd'
import { SpaceServerModule } from '../architecture/space-server'
import { SpacesCoreServer } from '../spaces-core/spaces-core-server'
import type { MsgServer } from '../spaces.types'
import { GameServer } from './game.server'

const update: SpaceServerModule['update'] = async (input) => {
  const spaceId = inputToSpaceId(input)

  if (!spaceId) {
    return {}
  }

  const spaceState = await SpacesCoreServer.getSpaceStarted(input.deps.spaceCoreDb, spaceId)

  if (!spaceState?.game) {
    return {}
  }

  const gameUpdated = await GameServer.update({
    deps: null,
    ctx: { ...input.deps.gameServer, ...input.ctx, space: spaceState },
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
    msgCore: input.msgCoreEvt?.t === 'game' ? { ...input.msgCoreEvt, ...input.msgCoreEvt.c } : null
  })

  return {
    msgCmd: SpaceServerCmd.map(gameUpdated.msgCmd, (c) => ({ t: 'game', c, spaceId })),
    msgCoreEvt: gameUpdated.msgCore?.map((e) => ({ ...e, spaceId, t: 'game', c: e }))
  }
}

const inputToSpaceId = (input: Parameters<SpaceServerModule['update']>[0]) => {
  if (input.msg && 'spaceId' in input.msg) {
    return input.msg.spaceId
  }

  if (input.msgClient && 'spaceId' in input.msgClient) {
    return input.msgClient.spaceId
  }

  if (input.msgCoreEvt && 'spaceId' in input.msgCoreEvt) {
    return input.msgCoreEvt.spaceId
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
