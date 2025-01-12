import { Err, type Result } from '~/@/result'
import { GameMainMenu } from '../@/ui/game-main-menu'
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
  | { t: 'none' }
  | { t: 'vs-user'; c: VsUser.ModelClient }
  | { t: 'vs-bot'; c: VsBot.ModelClient }

export type ModelBackend =
  | { t: 'none' }
  | { t: 'vs-user'; c: VsUser.ModelBackend }
  | { t: 'vs-bot'; c: VsBot.ModelBackend }

export const parseModel = (): Result<string, ModelBackend> => {
  return Err('Unimplemented')
}

//
//
//
// Msg
//
//
//

export type MsgClient =
  | GameMainMenu.Msg
  | { t: 'vs-user'; c: VsUser.MsgClient }
  | { t: 'vs-bot'; c: VsBot.MsgClient }
  | Req

export type MsgBackend = { t: 'vs-user'; c: VsUser.MsgBackend } | { t: 'vs-bot'; c: VsBot.MsgBackend }

export type MsgToBackend = { t: 'vs-user'; c: VsUser.MsgToBackend } | { t: 'vs-bot'; c: VsBot.MsgToBackend } | Req

export type MsgToClient = { t: 'vs-user'; c: VsUser.MsgToClient } | { t: 'vs-bot'; c: VsBot.MsgToClient } | Res

export type Req = {
  t: 'input-mode'
  mode: ModelBackend['t']
}

export type Res = Req & {
  result: Result<Problem, ModelBackend>
}

type Problem = 'must-be-host'
