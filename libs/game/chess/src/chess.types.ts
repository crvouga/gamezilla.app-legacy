import { RemoteData, Result, Unit } from '@gamezilla/core';
import { UserId } from '@gamezilla/shared';
import * as VsBot from './vs-bot/vs-bot.types';
import * as Puzzle from './puzzle/puzzle.types';
import * as VsUser from './vs-user/vs-user.types';

//
//
//
// Model
//
//
//

export type FrontendModel = {
  mode:
    | ['none']
    | ['vs-user', VsUser.FrontendModel]
    | ['vs-bot', VsBot.FrontendModel]
    | ['puzzle', Puzzle.FrontendModel];

  requests: {
    InputMode: RemoteData<InputModeProblem, Unit>;
  };
};

export type BackendModel =
  | ['none']
  | ['vs-user', VsUser.BackendModel]
  | ['vs-bot', VsBot.BackendModel]
  | ['puzzle', Puzzle.BackendModel];

type Mode = BackendModel[0];

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
  | ['puzzle', Puzzle.FrontendMsg]
  | InputMode
  | ['preload-audio-done'];

export type BackendMsg =
  | ['vs-user', VsUser.BackendMsg]
  | ['vs-bot', VsBot.BackendMsg]
  | ['puzzle', Puzzle.BackendMsg];

export type ToFrontend =
  | ['vs-user', VsUser.ToFrontend]
  | ['vs-bot', VsBot.ToFrontend]
  | ['puzzle', Puzzle.ToFrontend]
  | InputMode_Done;

export type ToBackend =
  | ['vs-user', VsUser.ToBackend]
  | ['vs-bot', VsBot.ToBackend]
  | ['puzzle', Puzzle.ToBackend]
  | InputMode;

//
//
//
//
//
//

export type InputMode = ['input-mode', { mode: Mode; userId: UserId }];
export type InputMode_Done = [
  'input-mode-done',
  { mode: Mode; userId: UserId },
  Result<InputModeProblem, BackendModel>
];
export type InputModeProblem = 'must_be_the_host';

export const inputModeProblemToString = (problem: InputModeProblem): string => {
  switch (problem) {
    case 'must_be_the_host': {
      return 'Must be the host';
    }
  }
};
