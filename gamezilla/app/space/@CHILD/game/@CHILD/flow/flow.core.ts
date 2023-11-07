import { Result } from "gamezilla/@SHARED/core";
import { PuzzleBuilder } from "./@CHILD/puzzle-builder";
import { Play } from "./@CHILD/play";

//
//
// Model
//
//

export type ClientModel =
  | { t: "none" }
  | { t: "puzzle-builder"; c: PuzzleBuilder.ClientModel }
  | { t: "play"; c: Play.ClientModel };

export type ServerModel =
  | { t: "none" }
  | { t: "puzzle-builder"; c: PuzzleBuilder.ServerModel }
  | { t: "play"; c: Play.ClientModel };

//
//
// Msg
//
//

export type ClientMsg =
  | Req
  | { t: "puzzle-builder"; c: PuzzleBuilder.ClientMsg }
  | { t: "play"; c: Play.ClientMsg };

export type ServerMsg =
  | { t: "puzzle-builder"; c: PuzzleBuilder.ServerMsg }
  | { t: "play"; c: Play.ServerMsg };

export type ToServer =
  | Req
  | { t: "puzzle-builder"; c: PuzzleBuilder.ToServer }
  | { t: "play"; c: Play.ToServer };

export type ToClient =
  | Res
  | { t: "puzzle-builder"; c: PuzzleBuilder.ToClient }
  | { t: "play"; c: Play.ToClient };

export type Req = {
  t: "input-mode";
  mode: ServerModel["t"];
};

export type Res = Req & {
  result: Result<string, ServerModel>;
};
