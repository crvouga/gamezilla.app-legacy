import { Sub } from 'gamezilla-app/@/core'
import { GameServerModule } from 'gamezilla-app/app/spaces/@/architecture/game-server-v2'
import type { SpaceServerCtx, SpaceServerEvt } from 'gamezilla-app/app/spaces/@/space'
import { SpaceServerCmd } from '../../@/space-server-cmd'
import { BuilderCore } from './builder/builder.core'
import { BuilderServer } from './builder/builder.server'
import type { ModelCore, ModelServer, MsgCore, MsgServer, MsgToClient, MsgToServer } from './flow.types'
import { PlayCore } from './play/play.core'
import { PlayServer } from './play/play.server'

type ServerModule = GameServerModule<{
  Model: ModelServer
  Msg: MsgServer
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  MsgCore: MsgCore
  ModelCore: ModelCore
  Ctx: SpaceServerCtx
  MsgEvtIn: SpaceServerEvt
  MsgCmdOut: SpaceServerCmd<MsgToClient>
  Deps: ServerDeps
}>

type ServerDeps = {
  builder: Awaited<ReturnType<(typeof BuilderServer)['deps']>>
  play: Awaited<ReturnType<(typeof PlayServer)['deps']>>
}

const deps: ServerModule['deps'] = async (input) => {
  return {
    builder: await BuilderServer.deps(input),
    play: await PlayServer.deps(input)
  }
}

const init: ServerModule['init'] = {
  t: 'none'
}

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen(
    { model: input.model },
    //
    (model) =>
      updatePlay({
        ...input,
        model
      }),
    (model) =>
      updateBuilder({
        ...input,
        model
      })
  )
}

const updateBuilder: ServerModule['update'] = async (input) => {
  const updated = await BuilderServer.update({
    ctx: input.ctx,
    modelCore:
      input.modelCore.t === 'builder'
        ? input.modelCore.c
        : BuilderCore.initCore({
            ctx: input.ctx
          }),
    model: input.model.t === 'builder' ? input.model.c : BuilderServer.init,
    msgCmd: input.msgCmd,
    msgEvt: input.msgEvt,
    msgClient:
      input.msgClient?.t === 'builder'
        ? {
            ...input.msgClient,
            ...input.msgClient.c
          }
        : null,
    msgCore:
      input.msgCore?.t === 'builder'
        ? {
            ...input.msgCore,
            ...input.msgCore.c
          }
        : null,
    msg: input.msg?.t === 'builder' ? input.msg.c : null,
    deps: input.deps.builder
  })

  const tagged = GameServerModule.tagOutput('builder', (msgCmd) => SpaceServerCmd.tag('builder', msgCmd), updated)

  return tagged
}

const updatePlay: ServerModule['update'] = async (input) => {
  const updated = await PlayServer.update({
    ctx: input.ctx,
    modelCore:
      input.modelCore.t === 'play'
        ? input.modelCore.c
        : PlayCore.initCore({
            ctx: input.ctx
          }),
    model: input.model.t === 'play' ? input.model.c : PlayServer.init,
    msgCmd: input.msgCmd,
    msgEvt: input.msgEvt,
    msgClient:
      input.msgClient?.t === 'play'
        ? {
            ...input.msgClient,
            ...input.msgClient.c
          }
        : null,
    msgCore:
      input.msgCore?.t === 'play'
        ? {
            ...input.msgCore,
            ...input.msgCore.c
          }
        : null,
    msg: input.msg?.t === 'play' ? input.msg.c : null,
    deps: input.deps.play
  })

  const tagged = GameServerModule.tagOutput('play', (msgCmd) => SpaceServerCmd.tag('play', msgCmd), updated)

  return tagged
}

const subscriptions: ServerModule['subscriptions'] = async (input) => {
  const { modelCore } = input

  switch (modelCore.t) {
    case 'play': {
      return Sub.tag(
        'play',
        await PlayServer.subscriptions({
          ctx: input.ctx,
          modelCore: modelCore.c,
          model: input.model.t === 'play' ? input.model.c : PlayServer.init
        })
      )
    }

    case 'builder': {
      return Sub.tag(
        'builder',
        await BuilderServer.subscriptions({
          ctx: input.ctx,
          modelCore: modelCore.c,
          model: input.model.t === 'builder' ? input.model.c : BuilderServer.init
        })
      )
    }

    case null: {
      return Sub.None
    }
  }
}

export const FlowServer = {
  init,
  subscriptions,
  update,
  deps
}
