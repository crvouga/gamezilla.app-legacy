import { Sub } from 'gamezilla-app/@/core'
import { GameServerModule } from 'gamezilla-app/app/spaces/games/@/architecture/game-server-v2'
import { SpaceServerCmd } from '../@/space-server-cmd'
import { GameName } from './@/game-name'
import { ConnectFourServer } from './connect-four/connect-four.server'
import { FlowServer } from './flow/server'
import type { GameServerCtx, ServerModule } from './game.types'
import { SpaceServerCtx } from '../@/space-server-ctx'

const initCtx = (input: { ctx: SpaceServerCtx }): GameServerCtx => {
  return {
    ...input.ctx,
    flow: FlowServer.initCtx(input)
  }
}

//
//
//
// Model
//
//
//

const init = (gameName: GameName): ServerModule['init'] => {
  switch (gameName) {
    case 'connect-four': {
      return {
        t: 'connect-four',
        c: ConnectFourServer.init
      }
    }

    case 'flow': {
      return {
        t: 'flow',
        c: FlowServer.init
      }
    }

    default: {
      return {
        t: 'connect-four',
        c: ConnectFourServer.init
      }
    }
  }
}

//
//
//
// Update
//
//
//

const update: ServerModule['update'] = async (input) => {
  switch (input.modelCore.t) {
    case 'flow': {
      const updated = await FlowServer.update({
        ctx: input.ctx.flow,
        modelCore: input.modelCore.c,
        msgCmd: input.msgCmd,
        msgEvt: input.msgEvt,
        msgClient: input.msgClient?.t === 'flow' ? { ...input.msgClient, ...input.msgClient.c } : null,
        msgCore: input.msgCore?.t === 'flow' ? { ...input.msgCore, ...input.msgCore.c } : null,
        msg: input.msg?.t === 'flow' ? input.msg.c : null,
        deps: null
      })

      return GameServerModule.tagOutput('flow', (msgCmd) => SpaceServerCmd.tag('flow', msgCmd), updated)
    }

    case 'connect-four': {
      const updated = await ConnectFourServer.update({
        ctx: input.ctx,
        modelCore: input.modelCore.c,
        msgCmd: input.msgCmd,
        msgEvt: input.msgEvt,
        msgClient: input.msgClient?.t === 'connect-four' ? { ...input.msgClient, ...input.msgClient.c } : null,
        msgCore: input.msgCore?.t === 'connect-four' ? { ...input.msgCore, ...input.msgCore.c } : null,
        msg: input.msg?.t === 'connect-four' ? input.msg.c : null,
        deps: null
      })

      return GameServerModule.tagOutput('connect-four', (msgCmd) => SpaceServerCmd.tag('connect-four', msgCmd), updated)
    }
  }
}

//
//
//
// Subscriptions
//
//
//

const subscriptions: ServerModule['subscriptions'] = async (input) => {
  switch (input.modelCore.t) {
    case 'connect-four': {
      return Sub.tag('connect-four', await ConnectFourServer.subscriptions({ ...input, modelCore: input.modelCore.c }))
    }

    case 'flow': {
      return Sub.tag(
        'flow',
        await FlowServer.subscriptions({
          ...input,
          modelCore: input.modelCore.c,
          ctx: input.ctx.flow
        })
      )
    }
  }
}

export const GameServer = {
  init,
  update,
  subscriptions,
  initCtx
}
