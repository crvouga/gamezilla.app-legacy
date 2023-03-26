import { Result } from '@gamezilla/core';
import { UserId } from '@gamezilla/temp-shared';
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
      type: 'none';
    }
  | {
      type: 'vs-user';
      child: VsUser.FrontendModel;
    }
  | {
      type: 'vs-bot';
      child: VsBot.FrontendModel;
    };

export type BackendModel =
  | {
      type: 'none';
    }
  | {
      type: 'vs-user';
      child: VsUser.BackendModel;
    }
  | {
      type: 'vs-bot';
      child: VsBot.BackendModel;
    };

export type Mode = BackendModel['type'];

//
//
//
// Msg
//
//
//

export type FrontendMsg =
  | Req
  | ['vs-user', VsUser.FrontendMsg]
  | ['vs-bot', VsBot.FrontendMsg];

export type BackendMsg =
  | ['vs-user', VsUser.BackendMsg]
  | ['vs-bot', VsBot.BackendMsg];

export type ToFrontend =
  | Res
  | ['vs-user', VsUser.ToFrontend]
  | ['vs-bot', VsBot.ToFrontend];

export type ToBackend =
  | Req
  | ['vs-user', VsUser.ToBackend]
  | ['vs-bot', VsBot.ToBackend];

//
//
//
//
//

export type Req = ['input-mode', { userId: UserId; mode: Mode }];

export type Res = [
  'input-mode',
  { userId: UserId; mode: Mode },
  Result<Problem, BackendModel>
];

export type Problem = 'must_be_host';
