import { Eff, Sub, Time } from "gamezilla/@SHARED/core";
import { SpaceEvt, SpaceServerCmd } from "gamezilla/app/space/@SHARED";
import * as Board from "../@SHARED/chess/chess";
import {
  initCore,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
} from "./vs-user.core";

//
//
//
// Model
//
//
//

export const init = initCore;

//
//
//
// Update
//
//
//

export const update = (
  _msg: ServerMsg,
  model: ServerModel
): { model: ServerModel } => {
  return { model };
};

export const updateFromClient = (
  _msg: ToServer,
  model: ServerModel
): {
  model: ServerModel;
  eff?: Eff<ServerMsg>;
  cmd?: SpaceServerCmd<ToClient>[];
} => {
  return { model };
};

export const updateFromEvent = ({
  msg,
  model,
}: {
  msg: SpaceEvt;
  model: ServerModel;
}): {
  model: ServerModel;
  eff?: Eff<ServerMsg>;
  cmd?: SpaceServerCmd<ToClient>[];
} => {
  if (msg.t === "user-left") {
    switch (model.type) {
      case "setup": {
        const { userId } = msg;
        const color: Board.Color | "none" =
          model.b === userId ? "b" : model.w === userId ? "w" : "none";

        if (color === "none") {
          return { model };
        }

        const modelNew: ServerModel = { ...model, [color]: "none" };

        return {
          model: modelNew,
          cmd: [{ t: "send-to-space", msg: ["player-left", modelNew] }],
        };
      }

      case "game":
      case "game-over": {
        const { userId } = msg;

        const color: Board.Color | "none" =
          model.b === userId ? "b" : model.w === userId ? "w" : "none";

        if (color === "none") {
          return { model };
        }

        const otherColor = Board.toOppositeColor(color);

        const modelNew: ServerModel = {
          ...model,
          type: "setup",
          clockPreset: model.clock.preset,
          [otherColor]: model[otherColor],
          [color]: "none",
        };

        return {
          model: modelNew,
          cmd: [{ t: "send-to-space", msg: ["player-left", modelNew] }],
        };
      }
    }
  }
  return { model };
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (
  intervalId: string,
  model: ServerModel
): Sub<ServerMsg> => {
  switch (model.type) {
    case "setup": {
      return Sub.None;
    }

    case "game-over": {
      return Sub.None;
    }

    case "game": {
      const turn = Board.toTurn(model.board);

      switch (turn) {
        case "b": {
          return Time.every(`${intervalId}-b`, 1000, () => ["ClockTicked"]);
        }
        case "w": {
          return Time.every(`${intervalId}-w`, 1000, () => ["ClockTicked"]);
        }
      }
    }
  }
};
