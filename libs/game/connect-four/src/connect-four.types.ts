import { Result } from '@gamezilla/core';
import * as VsBot from './vs-bot/vs-bot.types';
import * as VsUser from './vs-user/vs-user.types';

//
//
//
// Model
//
//
//

export type FrontendModel =
  | { t: 'none' }
  | { t: 'vs-user'; c: VsUser.FrontendModel }
  | { t: 'vs-bot'; c: VsBot.FrontendModel };

export type BackendModel =
  | { t: 'none' }
  | { t: 'vs-user'; c: VsUser.BackendModel }
  | { t: 'vs-bot'; c: VsBot.BackendModel };

export type Mode = BackendModel['t'];

//
//
//
// Msg
//
//
//

export type FrontendMsg =
  | { t: 'vs-user'; c: VsUser.FrontendMsg }
  | { t: 'vs-bot'; c: VsBot.FrontendMsg }
  | Req;

export type BackendMsg =
  | { t: 'vs-user'; c: VsUser.BackendMsg }
  | { t: 'vs-bot'; c: VsBot.BackendMsg };

export type ToFrontend =
  | { t: 'vs-user'; c: VsUser.ToFrontend }
  | { t: 'vs-bot'; c: VsBot.ToFrontend }
  | Res;

export type ToBackend =
  | { t: 'vs-user'; c: VsUser.ToBackend }
  | { t: 'vs-bot'; c: VsBot.ToBackend }
  | Req;

//
//
//
//
//

export type Req = { t: 'input-mode'; mode: Mode };
export type Res = Req & { result: Result<string, BackendModel> };
