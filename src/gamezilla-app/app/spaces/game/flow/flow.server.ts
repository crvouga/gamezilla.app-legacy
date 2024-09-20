import { Sub } from 'gamezilla-app/@/core'
import { GameServerModule } from 'gamezilla-app/app/spaces/@/architecture/game-server-v2'
import { SpaceServerCmd } from '../../@/space-server-cmd'
import { FlowPackDb, FlowPackListServer } from './@/flow-pack'
import { BuilderServer } from './builder/builder.server'
import type { ServerModule } from './flow.types'
import { PlayServer } from './play/play.server'

const deps: ServerModule['initDeps'] = async (input) => {
  return {
    builder: await BuilderServer.initDeps(input),
    play: await PlayServer.initDeps(input),
    flowPackList: {
      flowPackDb: FlowPackDb({
        t: 'db-conn-sql',
        dbConnSql: input.ctx.dbConnSql
      })
    }
  }
}

const init: ServerModule['init'] = {
  t: 'none'
}

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen(
    {},
    () => updatePlay(input),
    () => updateBuilder(input),
    () => updateFlowPackList(input)
  )
}

const updateFlowPackList: ServerModule['update'] = async (input) => {
  const updated = await FlowPackListServer.update({
    ctx: input.ctx,
    msgCmd: input.msgCmd,
    msgEvt: input.msgEvt,
    msgClient: input.msgClient?.t === 'flow-pack-list' ? { ...input.msgClient, ...input.msgClient.c } : null,
    msg: input.msg?.t === 'flow-pack-list' ? input.msg.c : null,
    deps: input.deps.flowPackList
  })

  return {
    msgCmd: SpaceServerCmd.tag('flow-pack-list', updated.msgCmd),
    msgEvt: updated.msgEvt
  }
}

const updateBuilder: ServerModule['update'] = async (input) => {
  const updated = await BuilderServer.update({
    ctx: input.ctx,
    modelCore: input.modelCore.builder,
    msgCmd: input.msgCmd,
    msgEvt: input.msgEvt,
    msgClient: input.msgClient?.t === 'builder' ? { ...input.msgClient, ...input.msgClient.c } : null,
    msgCore: input.msgCore?.t === 'builder' ? { ...input.msgCore, ...input.msgCore.c } : null,
    msg: input.msg?.t === 'builder' ? input.msg.c : null,
    deps: input.deps.builder
  })

  return {
    msgCmd: SpaceServerCmd.tag('builder', updated.msgCmd),
    msgCore: updated.msgCore?.map((c) => ({ ...c, t: 'builder', c })),
    msgEvt: updated.msgEvt
  }
}

const updatePlay: ServerModule['update'] = async (input) => {
  const updated = await PlayServer.update({
    ctx: input.ctx,
    modelCore: input.modelCore.play,
    msgCmd: input.msgCmd,
    msgEvt: input.msgEvt,
    msgClient: input.msgClient?.t === 'play' ? { ...input.msgClient, ...input.msgClient.c } : null,
    msgCore: input.msgCore?.t === 'play' ? { ...input.msgCore, ...input.msgCore.c } : null,
    msg: input.msg?.t === 'play' ? input.msg.c : null,
    deps: input.deps.play
  })

  return {
    msgCmd: SpaceServerCmd.tag('play', updated.msgCmd),
    msgCore: updated.msgCore?.map((c) => ({ ...c, t: 'play', c })),
    msgEvt: updated.msgEvt
  }
}

const subscriptions: ServerModule['subscriptions'] = async (_input) => {
  return Sub.None
}

export const FlowServer: ServerModule = {
  init,
  subscriptions,
  update,
  initDeps: deps
}
