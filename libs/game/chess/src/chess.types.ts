import { RemoteResult, Result, Unit } from '@gamezilla/core';
import { UserId } from '@gamezilla/shared';
import * as Puzzle from './puzzle/puzzle.types';
import * as VsBot from './vs-bot/vs-bot.types';
import * as VsUser from './vs-user/vs-user.types';

export type FrontendModel = {
  mode:
    | { t: 'none' }
    | { t: 'vs-user'; c: VsUser.FrontendModel }
    | { t: 'vs-bot'; c: VsBot.FrontendModel }
    | { t: 'puzzle'; c: Puzzle.FrontendModel };

  requests: {
    [req in Req['t']]?: RemoteResult<Problem, Unit>;
  };
};

export type BackendModel =
  | { t: 'none' }
  | { t: 'vs-user'; c: VsUser.BackendModel }
  | { t: 'vs-bot'; c: VsBot.BackendModel }
  | { t: 'puzzle'; c: Puzzle.BackendModel };

type Mode = BackendModel['t'];

export type FrontendMsg =
  | Req
  | { t: 'preload-audio-done' }
  | { t: 'vs-user'; c: VsUser.FrontendMsg }
  | { t: 'vs-bot'; c: VsBot.FrontendMsg }
  | { t: 'puzzle'; c: Puzzle.FrontendMsg };

export type BackendMsg =
  | { t: 'vs-user'; c: VsUser.BackendMsg }
  | { t: 'vs-bot'; c: VsBot.BackendMsg }
  | { t: 'puzzle'; c: Puzzle.BackendMsg };

export type ToFrontend =
  | Res
  | { t: 'vs-user'; c: VsUser.ToFrontend }
  | { t: 'vs-bot'; c: VsBot.ToFrontend }
  | { t: 'puzzle'; c: Puzzle.ToFrontend };

export type ToBackend =
  | Req
  | { t: 'vs-user'; c: VsUser.ToBackend }
  | { t: 'vs-bot'; c: VsBot.ToBackend }
  | { t: 'puzzle'; c: Puzzle.ToBackend };

export type Req = { t: 'input-mode'; mode: Mode; userId: UserId };
export type Res = Req & {
  result: Result<Problem, BackendModel>;
};
export type Problem = 'must_be_the_host';
