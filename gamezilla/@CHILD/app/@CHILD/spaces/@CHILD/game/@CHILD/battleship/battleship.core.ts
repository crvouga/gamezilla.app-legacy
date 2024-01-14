import { Result } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Position } from "./@SHARED/battleship/position";
import { ShotRule } from "./@SHARED/battleship/shot-rule";

const { err: Err } = Result;

//
//
// Model
//
//

type PlayerType = "player-one" | "player-two" | "player-three" | "player-four";

export type CoreModel = {
  players: Player[];
  ships: Ship[];
  shots: Shot[]; // newest first
  shotRule: ShotRule;
};

export const initShared = {
  players: [],
  ships: [],
  shots: [],
  shotRule: {
    t: "chain-fire",
  },
};

export type ClientModel = CoreModel;

export type ServerModel = CoreModel;

type Shot = {
  from: PlayerType;
  to: PlayerType;
  position: Position;
};

export type Ship = {
  topLeft: Position;
  orientation: "horizontal" | "vertical";
  type: ShipType;
};

type ShipType =
  | "Carrier"
  | "Battleship"
  | "Destroyer"
  | "Submarine"
  | "PatrolBoat";

export const shipTypeToLength: { [key in ShipType]: number } = {
  Carrier: 5,
  Battleship: 4,
  Destroyer: 3,
  Submarine: 3,
  PatrolBoat: 2,
};

type Player =
  | {
      type: "User";
      userId: UserId;
    }
  | {
      type: "Bot";
      level: BotLevel;
    };

type BotLevel = "Easy" | "Medium" | "Hard";

//
//
// Msg
//
//

export type ClientMsg = Req;

export type ServerMsg = { t: null };

export type Req =
  | { t: "start-playing"; team: PlayerType }
  | { t: "stop-playing"; team: PlayerType }
  | { t: "fire"; team: PlayerType; position: Position };

export type Res = Req & { result: Result<Problem, CoreModel> };

type Problem = "not-implemented" | "must-be-turn";

export const handle = ({
  msg,
  model,
}: {
  model: CoreModel;
  msg: Req;
}): Result<Problem, CoreModel> => {
  switch (msg.t) {
    case "start-playing": {
      return Err("not-implemented");
    }

    case "stop-playing": {
      return Err("not-implemented");
    }

    case "fire": {
      const turn = toTurn(model);

      if (turn !== msg.team) {
        return Err("must-be-turn");
      }

      return Err("not-implemented");
    }
  }
};

export const toNextPlayer = (player: PlayerType): PlayerType => {
  switch (player) {
    case "player-one": {
      return "player-two";
    }
    case "player-two": {
      return "player-three";
    }
    case "player-three": {
      return "player-four";
    }
    case "player-four": {
      return "player-one";
    }
  }
};

export const isNonEmpty = <T>(arr: T[]): arr is [T, ...T[]] => arr.length > 0;

export const toTurn = (model: CoreModel): PlayerType => {
  switch (model.shotRule.t) {
    case "chain-fire": {
      return "player-one";
    }

    case "count": {
      return toTurnRuleCount(model);
    }

    case "hitting-streak": {
      return "player-one";
    }
  }
};

const toTurnRuleCount = (model: CoreModel): PlayerType => {
  return "player-one";
};
