import { Result } from '@gamezilla/shared/core';
import { UserId } from '@gamezilla/shared/app';
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
  | {
      t: 'none';
    }
  | {
      t: 'vs-user';
      c: VsUser.FrontendModel;
    }
  | {
      t: 'vs-bot';
      c: VsBot.FrontendModel;
    };

export type ServerModel =
  | {
      t: 'none';
    }
  | {
      t: 'vs-user';
      c: VsUser.ServerModel;
    }
  | {
      t: 'vs-bot';
      c: VsBot.ServerModel;
    };

export type Mode = ServerModel['t'];

//
//
//
// Msg
//
//
//

export type FrontendMsg =
  | Req
  | { t: 'vs-user'; c: VsUser.FrontendMsg }
  | { t: 'vs-bot'; c: VsBot.FrontendMsg };

export type ServerMsg =
  | { t: 'vs-user'; c: VsUser.ServerMsg }
  | { t: 'vs-bot'; c: VsBot.ServerMsg };

export type ToFrontend =
  | Res
  | { t: 'vs-user'; c: VsUser.ToFrontend }
  | { t: 'vs-bot'; c: VsBot.ToFrontend };

export type ToBackend =
  | Req
  | { t: 'vs-user'; c: VsUser.ToBackend }
  | { t: 'vs-bot'; c: VsBot.ToBackend };

export type Req = { t: 'input-mode'; userId: UserId; mode: Mode };

export type Res = Req & {
  result: Result<Problem, ServerModel>;
};

export type Problem = 'must-be-host';
