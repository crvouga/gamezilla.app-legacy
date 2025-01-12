import type { RemoteResult, Result } from '~/@/result'
import type { UserId } from '~/app/@/data/user-id'
import type { SpaceCtx } from '~/app/spaces/@/space/ctx'
import type * as Puzzle from './puzzle/puzzle.types'
import type * as VsBot from './vs-bot/vs-bot.types'
import type * as VsUser from './vs-user/vs-user.types'
import { GameMainMenu } from '../@/ui/game-main-menu'

export type ModelClient = {
  mode:
    | { t: 'none' }
    | {
        t: 'vs-user'
        c: VsUser.ModelClient
      }
    | {
        t: 'vs-bot'
        c: VsBot.ModelClient
      }
    | {
        t: 'puzzle'
        c: Puzzle.ModelClient
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

export type MsgClient =
  | GameMainMenu.Msg
  | Req
  | { t: 'vs-user'; c: VsUser.MsgClient }
  | { t: 'vs-bot'; c: VsBot.MsgClient }
  | { t: 'puzzle'; c: Puzzle.MsgClient }

export type MsgBackend =
  | { t: 'vs-user'; c: VsUser.MsgBackend }
  | { t: 'vs-bot'; c: VsBot.MsgBackend }
  | { t: 'puzzle'; c: Puzzle.MsgBackend }

export type MsgToClient =
  | Res
  | { t: 'vs-user'; c: VsUser.MsgToClient }
  | { t: 'vs-bot'; c: VsBot.MsgToClient }
  | { t: 'puzzle'; c: Puzzle.MsgToClient }

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

export type MsgCore = { t: 'user-changed-mode'; mode: Mode; userId: UserId }

export type ModelCore =
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

export const initCore = (): ModelCore => {
  return {
    t: 'none',
  }
}

export const updateCore = ({ msgCore }: { ctx: SpaceCtx; modelCore: ModelCore; msgCore: MsgCore }): ModelCore => {
  switch (msgCore.t) {
    case 'user-changed-mode': {
      switch (msgCore.mode) {
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
