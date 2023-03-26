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
  | ['vs-user', VsUser.FrontendMsg]
  | ['vs-bot', VsBot.FrontendMsg]
  | InputMode;

export type BackendMsg =
  | ['vs-user', VsUser.BackendMsg]
  | ['vs-bot', VsBot.BackendMsg];

export type ToFrontend =
  | ['vs-user', VsUser.ToFrontend]
  | ['vs-bot', VsBot.ToFrontend]
  | InputMode_Done;

export type ToBackend =
  | ['vs-user', VsUser.ToBackend]
  | ['vs-bot', VsBot.ToBackend]
  | InputMode;

//
//
//
//
//

type InputMode = ['input-mode', { mode: Mode; userId: UserId }];
type InputMode_Done = ['input-mode-done', BackendModel];
