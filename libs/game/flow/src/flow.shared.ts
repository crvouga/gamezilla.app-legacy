import { Result } from '@gamezilla/shared/core';
import { PuzzleBuilder } from './puzzle-builder';
//
//
// Model
//
//

export type ClientModel =
  | { t: 'none' }
  | { t: 'puzzle-builder'; c: PuzzleBuilder.ClientModel };

export type ServerModel =
  | { t: 'none' }
  | { t: 'puzzle-builder'; c: PuzzleBuilder.ServerModel };

//
//
// Msg
//
//

export type ClientMsg =
  | Req
  | { t: 'puzzle-builder'; c: PuzzleBuilder.ClientMsg };

export type ServerMsg =
  | { t: 'none' }
  | { t: 'puzzle-builder'; c: PuzzleBuilder.ServerMsg };

export type ToServer = Req | { t: 'puzzle-builder'; c: PuzzleBuilder.ToServer };

export type ToClient = Res | { t: 'puzzle-builder'; c: PuzzleBuilder.ToClient };

export type Req = {
  t: 'input-mode';
  mode: ServerModel['t'];
};

export type Res = Req & {
  result: Result<string, ServerModel>;
};
