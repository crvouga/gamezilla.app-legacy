import type { WithEventMeta } from 'gamezilla-app/app/spaces/@/event'
import type { SpaceCtx } from 'gamezilla-app/app/spaces/@/space'
import { UserId } from 'gamezilla-app/app/@/data'
import type { GameMainMenu } from '../@/game'
import * as VsBot from './vs-bot/vs-bot.types'
import * as VsUser from './vs-user/vs-user.types'
import { p } from 'gamezilla-app/@/core/parser'

//
//
//
// Model
//
//
//

export type ModelClient = { t: 'vs-bot'; c: VsBot.ModelClient } | { t: 'vs-user'; c: VsUser.ModelClient } | { t: null }

export const ModelServer = p.or(
  p.obj({
    t: p.l('vs-bot'),
    c: VsBot.ModelServer
  }),
  p.obj({
    t: p.l('vs-user'),
    c: VsUser.ModelServer
  }),
  p.obj({
    t: p.l(null)
  })
)

export type ModelServer = p.Infer<typeof ModelServer>

export type Mode = 'none' | 'vs-user' | 'vs-bot'

//
//
//
// Msg
//
//
//

export type MsgClient =
  | GameMainMenu.Msg
  | MsgCore
  | { t: 'vs-user'; c: VsUser.MsgClient }
  | { t: 'vs-bot'; c: VsBot.MsgClient }

export type MsgServer = { t: 'vs-user'; c: VsUser.MsgServer } | { t: 'vs-bot'; c: VsBot.MsgServer }

export type MsgToClient = { t: 'vs-user'; c: VsUser.MsgToClient } | { t: 'vs-bot'; c: VsBot.MsgToClient }

export type MsgToServer = { t: 'vs-user'; c: VsUser.MsgToServer } | { t: 'vs-bot'; c: VsBot.MsgToServer }

//
//
//
//
//

export const MsgCore = p.or(
  p.obj({
    t: p.l('user-changed-mode'),
    mode: p.enumeration(['none', 'vs-user', 'vs-bot'] as const),
    userId: UserId
  }),
  p.obj({
    t: p.l('vs-bot'),
    c: VsBot.MsgCore
  }),
  p.obj({
    t: p.l('vs-user'),
    c: VsUser.MsgCore
  })
)
export type MsgCore = p.Infer<typeof MsgCore>

export const ModelCore = p.or(
  p.obj({
    t: p.l('none')
  }),
  p.obj({
    t: p.l('vs-user'),
    c: VsUser.ModelCore
  }),
  p.obj({
    t: p.l('vs-bot'),
    c: VsBot.ModelCore
  })
)
export type ModelCore = p.Infer<typeof ModelCore>

export const initCore = (): ModelCore => {
  return {
    t: 'none'
  }
}

export const updateCore = ({
  ctx,
  msgCore,
  modelCore
}: {
  ctx: SpaceCtx
  modelCore: ModelCore
  msgCore: WithEventMeta<MsgCore>
}): ModelCore => {
  switch (msgCore.t) {
    case 'user-changed-mode': {
      switch (msgCore.mode) {
        case 'none': {
          return {
            t: 'none'
          }
        }

        case 'vs-bot': {
          return {
            t: 'vs-bot',
            c: VsBot.initCore(ctx)
          }
        }

        case 'vs-user': {
          return {
            t: 'vs-user',
            c: VsUser.initCore(ctx)
          }
        }

        default: {
          return modelCore
        }
      }
    }

    case 'vs-bot': {
      switch (modelCore.t) {
        case 'vs-bot': {
          return {
            t: 'vs-bot',
            c: VsBot.updateCore({
              modelCore: modelCore.c,
              msgCore: {
                ...msgCore,
                ...msgCore.c
              }
            })
          }
        }
        default: {
          return modelCore
        }
      }
    }

    case 'vs-user': {
      switch (modelCore.t) {
        case 'vs-user': {
          return {
            t: 'vs-user',
            c: VsUser.updateCore(modelCore.c, msgCore.c)
          }
        }

        default: {
          return modelCore
        }
      }
    }
  }
}
