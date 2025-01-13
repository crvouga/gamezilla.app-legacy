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

export type ModelFrontend =
  | {
      t: 'none'
    }
  | {
      t: 'vs-user'
      c: VsUser.ModelFrontend
    }
  | {
      t: 'vs-bot'
      c: VsBot.ModelFrontend
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

export type MsgFrontend = Req | { t: 'vs-user'; c: VsUser.MsgFrontend } | { t: 'vs-bot'; c: VsBot.MsgFrontend }

export type MsgBackend = { t: 'vs-user'; c: VsUser.MsgBackend } | { t: 'vs-bot'; c: VsBot.MsgBackend }

export type MsgToFrontend = Res | { t: 'vs-user'; c: VsUser.MsgToFrontend } | { t: 'vs-bot'; c: VsBot.MsgToFrontend }

export type MsgToBackend = Req | { t: 'vs-user'; c: VsUser.MsgToBackend } | { t: 'vs-bot'; c: VsBot.MsgToBackend }

export type Req = { t: 'input-mode'; userId: UserId; mode: Mode }

export type Res = Req & {
  result: Result<Problem, ModelBackend>
}

export type Problem = 'must-be-host'
