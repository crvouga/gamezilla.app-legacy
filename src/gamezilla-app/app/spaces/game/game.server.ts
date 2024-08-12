import { Sub } from 'gamezilla-app/@/core'
import { GameServerModule } from '../@/architecture/game-server-v2'
import type { SpaceServerCtx, SpaceServerEvt } from '../@/space'
import { SpaceServerCmd } from '../@/space-server-cmd'
import { GameName } from './@/game-name'
import { ConnectFourServer } from './connect-four/connect-four.server'
import { FlowServer } from './flow/flow.server'
import type { ModelCore, ModelServer, MsgCore, MsgServer, MsgToClient, MsgToServer } from './game.types'

//
//
//
//
//
//
//

type ServerModule = GameServerModule<{
  Model: ModelServer
  Msg: MsgServer
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  ModelCore: ModelCore
  MsgCore: MsgCore
  Ctx: SpaceServerCtx
  MsgEvtIn: SpaceServerEvt
  MsgCmdOut: SpaceServerCmd<MsgToClient>
  Deps: ServerDeps
}>

type ServerDeps = {
  flow: Awaited<ReturnType<(typeof FlowServer)['deps']>>
}

const deps: ServerModule['deps'] = async (input) => {
  return {
    flow: await FlowServer.deps(input)
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
        ctx: input.ctx,
        modelCore: input.modelCore.c,
        msgCmd: input.msgCmd,
        msgEvt: input.msgEvt,
        msgClient:
          input.msgClient?.t === 'flow'
            ? {
                ...input.msgClient,
                ...input.msgClient.c
              }
            : null,
        msgCore:
          input.msgCore?.t === 'flow'
            ? {
                ...input.msgCore,
                ...input.msgCore.c
              }
            : null,
        msg: input.msg?.t === 'flow' ? input.msg.c : null,
        deps: input.deps.flow
      })

      const tagged = GameServerModule.tagOutput('flow', (msgCmd) => SpaceServerCmd.tag('flow', msgCmd), updated)

      return tagged
    }

    case 'connect-four': {
      const updated = await ConnectFourServer.update({
        ctx: input.ctx,
        modelCore: input.modelCore.c,
        msgCmd: input.msgCmd,
        msgEvt: input.msgEvt,
        msgClient:
          input.msgClient?.t === 'connect-four'
            ? {
                ...input.msgClient,
                ...input.msgClient.c
              }
            : null,
        msgCore:
          input.msgCore?.t === 'connect-four'
            ? {
                ...input.msgCore,
                ...input.msgCore.c
              }
            : null,
        msg: input.msg?.t === 'connect-four' ? input.msg.c : null,
        deps: null
      })

      const tagged = GameServerModule.tagOutput(
        'connect-four',
        (msgCmd) => SpaceServerCmd.tag('connect-four', msgCmd),
        updated
      )

      return tagged
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
      return Sub.tag(
        'connect-four',
        await ConnectFourServer.subscriptions({
          ...input,
          modelCore: input.modelCore.c
        })
      )
    }

    case 'flow': {
      return Sub.tag(
        'flow',
        await FlowServer.subscriptions({
          ...input,
          modelCore: input.modelCore.c
        })
      )
    }
  }
}

export const GameServer = {
  init,
  update,
  subscriptions,
  deps
}
