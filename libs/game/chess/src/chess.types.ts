import { RemoteResult, Result, Unit } from '@gamezilla/shared/core';
import { UserId } from '@gamezilla/shared/app';
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

export type ServerModel =
  | { t: 'none' }
  | { t: 'vs-user'; c: VsUser.ServerModel }
  | { t: 'vs-bot'; c: VsBot.ServerModel }
  | { t: 'puzzle'; c: Puzzle.ServerModel };

type Mode = ServerModel['t'];

export type FrontendMsg =
  | Req
  | { t: 'preload-audio-done' }
  | { t: 'vs-user'; c: VsUser.FrontendMsg }
  | { t: 'vs-bot'; c: VsBot.FrontendMsg }
  | { t: 'puzzle'; c: Puzzle.FrontendMsg };

export type ServerMsg =
  | { t: 'vs-user'; c: VsUser.ServerMsg }
  | { t: 'vs-bot'; c: VsBot.ServerMsg }
  | { t: 'puzzle'; c: Puzzle.ServerMsg };

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
  result: Result<Problem, ServerModel>;
};
export type Problem = 'must_be_the_host';
