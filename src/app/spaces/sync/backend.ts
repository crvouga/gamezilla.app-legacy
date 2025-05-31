import { EventSourced } from '~/@/event-sourced'
import { isErr, unwrapOr } from '~/@/result'
import { RPC } from '~/@/rpc'
import { SpaceBackendModule } from '../architecture/space-backend'
import { Space } from '../core/space'
import { SpaceBackendCtxModule } from '../types'
import { MsgBackend, rpcContract } from './types'

const update: SpaceBackendModule['update'] = async (input) => {
  switch (input.msg?.t) {
    case 'sync.got-msg-space': {
      return {
        msgSpace: [input.msg.c],
      }
    }
  }

  return {}
}

const subscriptions: SpaceBackendModule['subscriptions'] = (input) => {
  return input.ctx.topic.sync.msgSpaceAll.subscribe(null, (c): MsgBackend => ({ t: 'sync.got-msg-space', c }))
}

const rpc = (config: { ctx: SpaceBackendCtxModule }) => {
  return RPC.initServer(rpcContract, {
    async sync(input) {
      const merged = await config.ctx.spacesCore.merge(input.space)

      if (isErr(merged)) {
        return { space: input.space }
      }

      const spaceId = Space.toSpaceId(input.space)

      if (!spaceId) {
        return { space: input.space }
      }

      const spaceNew = unwrapOr(await config.ctx.spacesCore.get(spaceId), null)

      if (!spaceNew) {
        return { space: input.space }
      }

      const starting = EventSourced.startFromLatestSnapshot(spaceNew)

      return { space: starting }
    },
  })
}

export const SyncBackend = {
  update,
  subscriptions,
  rpc,
}
