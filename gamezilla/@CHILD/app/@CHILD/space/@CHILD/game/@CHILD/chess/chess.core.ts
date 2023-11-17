import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { RemoteResult, Result } from "gamezilla/@SHARED/core";
import * as Puzzle from "./@CHILD/puzzle/puzzle.core";
import * as VsBot from "./@CHILD/vs-bot/vs-bot.core";
import * as VsUser from "./@CHILD/vs-user/vs-user.core";

export type ClientModel = {
  mode:
    | { t: "none" }
    | { t: "vs-user"; c: VsUser.ClientModel }
    | { t: "vs-bot"; c: VsBot.ClientModel }
    | { t: "puzzle"; c: Puzzle.ClientModel };

  requests?: {
    [req in Req["t"]]?: RemoteResult<Problem, null>;
  };
};

export type ServerModel =
  | { t: "none" }
  | { t: "vs-user"; c: VsUser.ServerModel }
  | { t: "vs-bot"; c: VsBot.ServerModel }
  | { t: "puzzle"; c: Puzzle.ServerModel };

type Mode = ServerModel["t"];

export type ClientMsg =
  | Req
  | { t: "vs-user"; c: VsUser.ClientMsg }
  | { t: "vs-bot"; c: VsBot.ClientMsg }
  | { t: "puzzle"; c: Puzzle.ClientMsg };

export type ServerMsg =
  | { t: "vs-user"; c: VsUser.ServerMsg }
  | { t: "vs-bot"; c: VsBot.ServerMsg }
  | { t: "puzzle"; c: Puzzle.ServerMsg };

export type ToClient =
  | Res
  | { t: "vs-user"; c: VsUser.ToClient }
  | { t: "vs-bot"; c: VsBot.ToClient }
  | { t: "puzzle"; c: Puzzle.ToClient };

export type ToServer =
  | Req
  | { t: "vs-user"; c: VsUser.ToServer }
  | { t: "vs-bot"; c: VsBot.ToServer }
  | { t: "puzzle"; c: Puzzle.ToServer };

export type Req = { t: "input-mode"; mode: Mode; userId: UserId };
export type Res = Req & {
  result: Result<Problem, ServerModel>;
};
export type Problem = "must_be_the_host";

//
//
//
//
//
//
//
//
//

export type GameEvent = { t: "user-changed-mode"; mode: Mode; userId: UserId };

export type GameState =
  | {
      t: "none";
    }
  | {
      t: "vs-user";
    }
  | {
      t: "vs-bot";
    };

export const initState = (): GameState => {
  return {
    t: "none",
  };
};

export const reducer = ({
  ctx,
  event,
  state,
}: {
  ctx: SpaceCtx;
  state: GameState;
  event: GameEvent;
}): GameState => {
  switch (event.t) {
    case "user-changed-mode": {
      switch (event.mode) {
        case "none": {
          return { t: "none" };
        }
        case "puzzle": {
          return { t: "none" };
        }
        case "vs-bot": {
          return { t: "none" };
        }
        case "vs-user": {
          return { t: "none" };
        }
      }
    }
  }
};
