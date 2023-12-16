import { EventMeta } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/event";
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

export type GameState =
  | {
      t: "connect-four";
      c: ConnectFour.GameState;
    }
  | {
      t: "flow";
      c: Flow.GameState;
    };

export const initState = (gameName: GameName): GameState => {
  switch (gameName) {
    case "connect-four": {
      return {
        t: "connect-four",
        c: ConnectFour.initState(),
      };
    }

    case "flow": {
      return {
        t: "flow",
        c: Flow.initState(),
      };
    }
  }
};

export type GameEvent =
  | { t: "connect-four"; c: ConnectFour.GameEvent }
  | { t: "flow"; c: Flow.GameEvent };

export const reducer = ({
  ctx,
  state,
  event,
}: {
  ctx: SpaceCtx;
  state: GameState;
  event: GameEvent & EventMeta;
}): GameState => {
  if (state.t === "connect-four" && event.t === "connect-four") {
    return {
      t: "connect-four",
      c: ConnectFour.reducer({
        ctx,
        event: { ...event, ...event.c },
        state: state.c,
      }),
    };
  }

  return state;
};
