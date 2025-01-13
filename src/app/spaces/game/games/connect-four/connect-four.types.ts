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
  | MsgSpace
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

export const MsgSpace = p.or(
  p.obj({
    t: p.l('user-changed-mode'),
    mode: p.enumeration(['none', 'vs-user', 'vs-bot'] as const),
    userId: UserId,
  }),
  p.obj({
    t: p.l('vs-bot'),
    c: VsBot.MsgSpace,
  }),
  p.obj({
    t: p.l('vs-user'),
    c: VsUser.MsgSpace,
  }),
)
export type MsgSpace = p.Infer<typeof MsgSpace>

export const ModelSpace = p.or(
  p.obj({
    t: p.l('none'),
  }),
  p.obj({
    t: p.l('vs-user'),
    c: VsUser.ModelSpace,
  }),
  p.obj({
    t: p.l('vs-bot'),
    c: VsBot.ModelSpace,
  }),
)
export type ModelSpace = p.Infer<typeof ModelSpace>

export const initSpace = (): ModelSpace => {
  return {
    t: 'none',
  }
}

export const updateSpace = ({
  ctx,
  msgSpace,
  modelSpace,
}: {
  ctx: SpaceCtx
  modelSpace: ModelSpace
  msgSpace: WithEventMeta<MsgSpace>
}): ModelSpace => {
  switch (msgSpace.t) {
    case 'user-changed-mode': {
      switch (msgSpace.mode) {
        case 'none': {
          return {
            t: 'none',
          }
        }

        case 'vs-bot': {
          return {
            t: 'vs-bot',
            c: VsBot.initSpace(ctx),
          }
        }

        case 'vs-user': {
          return {
            t: 'vs-user',
            c: VsUser.initSpace(ctx),
          }
        }

        default: {
          return modelSpace
        }
      }
    }

    case 'vs-bot': {
      switch (modelSpace.t) {
        case 'vs-bot': {
          return {
            t: 'vs-bot',
            c: VsBot.updateSpace({
              modelSpace: modelSpace.c,
              msgSpace: {
                ...msgSpace,
                ...msgSpace.c,
              },
            }),
          }
        }
        default: {
          return modelSpace
        }
      }
    }

    case 'vs-user': {
      switch (modelSpace.t) {
        case 'vs-user': {
          return {
            t: 'vs-user',
            c: VsUser.updateSpace(modelSpace.c, msgSpace.c),
          }
        }

        default: {
          return modelSpace
        }
      }
    }
  }
}
