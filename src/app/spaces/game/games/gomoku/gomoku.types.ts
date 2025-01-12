import type { Result } from '~/@/result'
import type { UserId } from '~/app/@/data/user-id'
import type * as VsBot from './vs-bot/vs-bot.types'
import type * as VsUser from './vs-user/vs-user.types'

//
//
//
// Model
//
//
//

export type ModelClient =
  | {
      t: 'none'
    }
  | {
      t: 'vs-user'
      c: VsUser.ModelClient
    }
  | {
      t: 'vs-bot'
      c: VsBot.ModelClient
    }

export type ModelBackend =
  | {
      t: 'none'
    }
  | {
      t: 'vs-user'
      c: VsUser.ModelBackend
    }
  | {
      t: 'vs-bot'
      c: VsBot.ModelBackend
    }

export type Mode = ModelBackend['t']

//
//
//
// Msg
//
//
//

export type MsgClient = Req | { t: 'vs-user'; c: VsUser.MsgClient } | { t: 'vs-bot'; c: VsBot.MsgClient }

export type MsgBackend = { t: 'vs-user'; c: VsUser.MsgBackend } | { t: 'vs-bot'; c: VsBot.MsgBackend }

export type MsgToClient = Res | { t: 'vs-user'; c: VsUser.MsgToClient } | { t: 'vs-bot'; c: VsBot.MsgToClient }

export type MsgToBackend = Req | { t: 'vs-user'; c: VsUser.MsgToBackend } | { t: 'vs-bot'; c: VsBot.MsgToBackend }

export type Req = { t: 'input-mode'; userId: UserId; mode: Mode }

export type Res = Req & {
  result: Result<Problem, ModelBackend>
}

export type Problem = 'must-be-host'
