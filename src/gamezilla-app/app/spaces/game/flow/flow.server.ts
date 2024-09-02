import { Sub } from 'gamezilla-app/@/core'
import { GameServerModule } from 'gamezilla-app/app/spaces/@/architecture/game-server-v2'
import { SpaceServerCmd } from '../../@/space-server-cmd'
import { BuilderCore } from './builder/builder.core'
import { BuilderServer } from './builder/builder.server'
import type { ServerModule } from './flow.types'
import { PlayCore } from './play/play.core'
import { PlayServer } from './play/play.server'

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
    {},
    () => updatePlay(input),
    () => updateBuilder(input)
  )
}

const updateBuilder: ServerModule['update'] = async (input) => {
  const updated = await BuilderServer.update({
    ctx: input.ctx,
    modelCore: input.modelCore.t === 'builder' ? input.modelCore.c : BuilderCore.initCore({ ctx: input.ctx }),
    msgCmd: input.msgCmd,
    msgEvt: input.msgEvt,
    msgClient: input.msgClient?.t === 'builder' ? { ...input.msgClient, ...input.msgClient.c } : null,
    msgCore: input.msgCore?.t === 'builder' ? { ...input.msgCore, ...input.msgCore.c } : null,
    msg: input.msg?.t === 'builder' ? input.msg.c : null,
    deps: input.deps.builder
  })

  const tagged = GameServerModule.tagOutput('builder', (msgCmd) => SpaceServerCmd.tag('builder', msgCmd), updated)

  return tagged
}

const updatePlay: ServerModule['update'] = async (input) => {
  const updated = await PlayServer.update({
    ctx: input.ctx,
    modelCore: input.modelCore.t === 'play' ? input.modelCore.c : PlayCore.initCore({ ctx: input.ctx }),
    msgCmd: input.msgCmd,
    msgEvt: input.msgEvt,
    msgClient: input.msgClient?.t === 'play' ? { ...input.msgClient, ...input.msgClient.c } : null,
    msgCore: input.msgCore?.t === 'play' ? { ...input.msgCore, ...input.msgCore.c } : null,
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
      return Sub.tag('play', await PlayServer.subscriptions({ ctx: input.ctx, modelCore: modelCore.c }))
    }

    case 'builder': {
      return Sub.tag('builder', await BuilderServer.subscriptions({ ctx: input.ctx, modelCore: modelCore.c }))
    }

    case null: {
      return Sub.None
    }
  }
}

export const FlowServer: ServerModule = {
  init,
  subscriptions,
  update,
  deps
}
