import type { RemoteResult, Result } from '~/@/result'
import type { UserId } from '~/app/@/data/user-id'
import type { SpaceCtx } from '~/app/spaces/@/space/ctx'
import type * as Puzzle from './puzzle/puzzle.types'
import type * as VsBot from './vs-bot/vs-bot.types'
import type * as VsUser from './vs-user/vs-user.types'
import { GameMainMenu } from '../@/ui/game-main-menu'

export type ModelFrontend = {
  mode:
    | { t: 'none' }
    | {
        t: 'vs-user'
        c: VsUser.ModelFrontend
      }
    | {
        t: 'vs-bot'
        c: VsBot.ModelFrontend
      }
    | {
        t: 'puzzle'
        c: Puzzle.ModelFrontend
      }

  requests?: {
    [req in Req['t']]?: RemoteResult<Problem, null>
  }
}

export type ModelBackend =
  | { t: 'none' }
  | { t: 'vs-user'; c: VsUser.ModelBackend }
  | { t: 'vs-bot'; c: VsBot.ModelBackend }
  | { t: 'puzzle'; c: Puzzle.ModelBackend }

type Mode = ModelBackend['t']

export type MsgFrontend =
  | GameMainMenu.Msg
  | Req
  | { t: 'vs-user'; c: VsUser.MsgFrontend }
  | { t: 'vs-bot'; c: VsBot.MsgFrontend }
  | { t: 'puzzle'; c: Puzzle.MsgFrontend }

export type MsgBackend =
  | { t: 'vs-user'; c: VsUser.MsgBackend }
  | { t: 'vs-bot'; c: VsBot.MsgBackend }
  | { t: 'puzzle'; c: Puzzle.MsgBackend }

export type MsgToFrontend =
  | Res
  | { t: 'vs-user'; c: VsUser.MsgToFrontend }
  | { t: 'vs-bot'; c: VsBot.MsgToFrontend }
  | { t: 'puzzle'; c: Puzzle.MsgToFrontend }

export type MsgToBackend =
  | Req
  | { t: 'vs-user'; c: VsUser.MsgToBackend }
  | { t: 'vs-bot'; c: VsBot.MsgToBackend }
  | { t: 'puzzle'; c: Puzzle.MsgToBackend }

export type Req = { t: 'input-mode'; mode: Mode; userId: UserId }
export type Res = Req & {
  result: Result<Problem, ModelBackend>
}
export type Problem = 'must_be_the_host'

//
//
//
//
//
//
//
//
//

export type MsgSpace = { t: 'user-changed-mode'; mode: Mode; userId: UserId }

export type ModelSpace =
  | {
      t: 'none'
    }
  | {
      t: 'vs-user'
    }
  | {
      t: 'vs-bot'
    }
  | {
      t: 'puzzle'
    }

export const initSpace = (): ModelSpace => {
  return {
    t: 'none',
  }
}

export const updateSpace = ({
  msgSpace,
}: {
  ctx: SpaceCtx
  modelSpace: ModelSpace
  msgSpace: MsgSpace
}): ModelSpace => {
  switch (msgSpace.t) {
    case 'user-changed-mode': {
      switch (msgSpace.mode) {
        case 'none': {
          return {
            t: 'none',
          }
        }
        case 'puzzle': {
          return {
            t: 'none',
          }
        }
        case 'vs-bot': {
          return {
            t: 'none',
          }
        }
        case 'vs-user': {
          return {
            t: 'none',
          }
        }
      }
    }
  }
}
