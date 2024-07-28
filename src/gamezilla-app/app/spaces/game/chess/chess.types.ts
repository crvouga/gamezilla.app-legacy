import type { RemoteResult, Result } from 'gamezilla-app/@/core'
import type { UserId } from 'gamezilla-app/app/@/data'
import type { SpaceCtx } from 'gamezilla-app/app/spaces/@/space'
import type { GameMainMenu } from '../@/game'
import type * as Puzzle from './puzzle/puzzle.types'
import type * as VsBot from './vs-bot/vs-bot.types'
import type * as VsUser from './vs-user/vs-user.types'

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

export type ModelServer =
  | { t: 'none' }
  | { t: 'vs-user'; c: VsUser.ModelServer }
  | { t: 'vs-bot'; c: VsBot.ModelServer }
  | { t: 'puzzle'; c: Puzzle.ModelServer }

type Mode = ModelServer['t']

export type MsgClient =
  | GameMainMenu.Msg
  | Req
  | { t: 'vs-user'; c: VsUser.MsgClient }
  | { t: 'vs-bot'; c: VsBot.MsgClient }
  | { t: 'puzzle'; c: Puzzle.MsgClient }

export type MsgServer =
  | { t: 'vs-user'; c: VsUser.MsgServer }
  | { t: 'vs-bot'; c: VsBot.MsgServer }
  | { t: 'puzzle'; c: Puzzle.MsgServer }

export type MsgToClient =
  | Res
  | { t: 'vs-user'; c: VsUser.MsgToClient }
  | { t: 'vs-bot'; c: VsBot.MsgToClient }
  | { t: 'puzzle'; c: Puzzle.MsgToClient }

export type MsgToServer =
  | Req
  | { t: 'vs-user'; c: VsUser.MsgToServer }
  | { t: 'vs-bot'; c: VsBot.MsgToServer }
  | { t: 'puzzle'; c: Puzzle.MsgToServer }

export type Req = { t: 'input-mode'; mode: Mode; userId: UserId }
export type Res = Req & {
  result: Result<Problem, ModelServer>
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
    t: 'none'
  }
}

export const updateCore = ({ msgCore }: { ctx: SpaceCtx; modelCore: ModelCore; msgCore: MsgCore }): ModelCore => {
  switch (msgCore.t) {
    case 'user-changed-mode': {
      switch (msgCore.mode) {
        case 'none': {
          return {
            t: 'none'
          }
        }
        case 'puzzle': {
          return {
            t: 'none'
          }
        }
        case 'vs-bot': {
          return {
            t: 'none'
          }
        }
        case 'vs-user': {
          return {
            t: 'none'
          }
        }
      }
    }
  }
}
