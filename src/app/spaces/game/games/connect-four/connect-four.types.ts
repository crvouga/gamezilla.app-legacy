import type { WithEventMeta } from '~/@/event-sourced/event'
import type { SpaceCtx } from '~/app/spaces/@/space/ctx'
import { UserId } from '~/app/@/data/user-id'
import * as VsBot from './vs-bot/vs-bot.types'
import * as VsUser from './vs-user/vs-user.types'
import { p } from '~/@/parser'
import { GameMainMenu } from '../@/ui/game-main-menu'

//
//
//
// Model
//
//
//

export type ModelFrontend =
  | { t: 'vs-bot'; c: VsBot.ModelFrontend }
  | { t: 'vs-user'; c: VsUser.ModelFrontend }
  | { t: null }

export const ModelBackend = p.or(
  p.obj({
    t: p.l('vs-bot'),
    c: VsBot.ModelBackend,
  }),
  p.obj({
    t: p.l('vs-user'),
    c: VsUser.ModelBackend,
  }),
  p.obj({
    t: p.l(null),
  }),
)

export type ModelBackend = p.Infer<typeof ModelBackend>

export type Mode = 'none' | 'vs-user' | 'vs-bot'

//
//
//
// Msg
//
//
//

export type MsgFrontend =
  | GameMainMenu.Msg
  | MsgCore
  | { t: 'vs-user'; c: VsUser.MsgFrontend }
  | { t: 'vs-bot'; c: VsBot.MsgFrontend }

export type MsgBackend = { t: 'vs-user'; c: VsUser.MsgBackend } | { t: 'vs-bot'; c: VsBot.MsgBackend }

export type MsgToFrontend = { t: 'vs-user'; c: VsUser.MsgToFrontend } | { t: 'vs-bot'; c: VsBot.MsgToFrontend }

export type MsgToBackend = { t: 'vs-user'; c: VsUser.MsgToBackend } | { t: 'vs-bot'; c: VsBot.MsgToBackend }

//
//
//
//
//

export const MsgCore = p.or(
  p.obj({
    t: p.l('user-changed-mode'),
    mode: p.enumeration(['none', 'vs-user', 'vs-bot'] as const),
    userId: UserId,
  }),
  p.obj({
    t: p.l('vs-bot'),
    c: VsBot.MsgCore,
  }),
  p.obj({
    t: p.l('vs-user'),
    c: VsUser.MsgCore,
  }),
)
export type MsgCore = p.Infer<typeof MsgCore>

export const ModelCore = p.or(
  p.obj({
    t: p.l('none'),
  }),
  p.obj({
    t: p.l('vs-user'),
    c: VsUser.ModelCore,
  }),
  p.obj({
    t: p.l('vs-bot'),
    c: VsBot.ModelCore,
  }),
)
export type ModelCore = p.Infer<typeof ModelCore>

export const initCore = (): ModelCore => {
  return {
    t: 'none',
  }
}

export const updateCore = ({
  ctx,
  msgCore,
  modelCore,
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
            t: 'none',
          }
        }

        case 'vs-bot': {
          return {
            t: 'vs-bot',
            c: VsBot.initCore(ctx),
          }
        }

        case 'vs-user': {
          return {
            t: 'vs-user',
            c: VsUser.initCore(ctx),
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
                ...msgCore.c,
              },
            }),
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
            c: VsUser.updateCore(modelCore.c, msgCore.c),
          }
        }

        default: {
          return modelCore
        }
      }
    }
  }
}
