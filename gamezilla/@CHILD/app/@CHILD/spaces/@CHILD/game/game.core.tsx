import { EventMeta } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { SpaceCtx } from "../../@SHARED/space";
import * as Flow from "./@CHILD/flow/flow.core";
import * as ConnectFour from "./@CHILD/connect-four/connect-four.core";
//
//
//
// Model
//
//
//

export type ClientModel =
  | { t: "connect-four"; c: ConnectFour.ClientModel }
  | { t: "flow"; c: Flow.ClientModel };

export type ServerModel =
  | { t: "connect-four"; c: ConnectFour.ServerModel }
  | { t: "flow"; c: Flow.ServerModel };

//
//
//
// Msg
//
//
//

export type ServerMsg =
  | { t: "connect-four"; c: ConnectFour.ServerMsg }
  | { t: "flow"; c: Flow.ServerMsg };

export type ClientMsg =
  | { t: "connect-four"; c: ConnectFour.ClientMsg }
  | { t: "flow"; c: Flow.ClientMsg };

export type ToClient =
  | { t: "connect-four"; c: ConnectFour.ToClient }
  | { t: "flow"; c: Flow.ToClient };

export type ToServer =
  | { t: "connect-four"; c: ConnectFour.ToServer }
  | { t: "flow"; c: Flow.ToServer };

//
//
//
// Game Name
//
//
//

export type GameName = "connect-four" | "flow";

export const gameNames: { [gameName in GameName]: GameName } = {
  "connect-four": "connect-four",
  flow: "flow",
};

export const gameNameList: GameName[] = ["connect-four", "flow"];

export const gameNameToString = (gameName: GameName): string => {
  switch (gameName) {
    case "connect-four": {
      return "Connect Four";
    }

    case "flow": {
      return "Flow";
    }
  }
};

export type GameModel =
  | {
      t: "connect-four";
      c: ConnectFour.GameModel;
    }
  | {
      t: "flow";
      c: Flow.GameModel;
    };

export const initGame = (gameName: GameName): GameModel => {
  switch (gameName) {
    case "connect-four": {
      return {
        t: "connect-four",
        c: ConnectFour.initGame(),
      };
    }

    case "flow": {
      return {
        t: "flow",
        c: Flow.initGame(),
      };
    }
  }
};

export type GameMsg =
  | { t: "connect-four"; c: ConnectFour.GameMsg }
  | { t: "flow"; c: Flow.GameMsg };

export const reducer = ({
  ctx,
  modelGame,
  msgEvent,
}: {
  ctx: SpaceCtx;
  modelGame: GameModel;
  msgEvent: GameMsg & EventMeta;
}): GameModel => {
  switch (modelGame.t) {
    case "connect-four": {
      switch (msgEvent.t) {
        case "connect-four": {
          return {
            t: "connect-four",
            c: ConnectFour.reducer({
              ctx,
              msgEvent: { ...msgEvent, ...msgEvent.c },
              modelGame: modelGame.c,
            }),
          };
        }
        default: {
          return modelGame;
        }
      }
    }

    case "flow": {
      switch (msgEvent.t) {
        case "flow": {
          return {
            t: "flow",
            c: Flow.reducer({
              ctx,
              msgEvent: { ...msgEvent, ...msgEvent.c },
              modelGame: modelGame.c,
            }),
          };
        }

        default: {
          return modelGame;
        }
      }
    }
  }
};
