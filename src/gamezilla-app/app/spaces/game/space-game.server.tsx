import { Result, Sub } from 'gamezilla-app/@/core'
import { SpaceServerModule } from '../@/architecture/space-server'
import { SpaceServerCmd } from '../@/space-server-cmd'
import type { MsgServer } from '../spaces.types'
import { GameServer } from './game.server'
import { SpaceCore } from '../spaces-core'
import { withEventId } from '../@/event'

const update: SpaceServerModule['update'] = async (input) => {
  const spaceId = inputToSpaceId(input)

  if (!spaceId) {
    return {}
  }

  const spaceState = SpaceCore.toSpaceStarted(Result.unwrapOr(await input.deps.spacesCoreServer.get(spaceId), null))

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
    msgCore: input.msgCore?.t === 'game' ? { ...input.msgCore, ...input.msgCore.c } : null
  })

  return {
    msgCmd: SpaceServerCmd.map(gameUpdated.msgCmd, (c) => ({ t: 'game', c, spaceId })),
    msgCore: gameUpdated.msgCore?.map((e) => withEventId({ ...e, spaceId, t: 'game', c: e }))
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

export const SpaceGameServer = {
  subscriptions,
  update
}
