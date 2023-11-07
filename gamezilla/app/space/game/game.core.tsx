import { SpaceCtx } from "../@SHARED";
import * as ConnectFour from "./@CHILD/connect-four/connect-four.core";

//
//
//
// Model
//
//
//

export type ClientModel = { t: "connect-four"; c: ConnectFour.ClientModel };

// | { t: "tic-tac-toe"; c: TicTacToe.ClientModel }
// | { t: "chess"; c: Chess.ClientModel }
// | { t: "flow"; c: Flow.ClientModel };

export type ServerModel = { t: "connect-four"; c: ConnectFour.ServerModel };

// | { t: "tic-tac-toe"; c: TicTacToe.ServerModel }
// | { t: "chess"; c: Chess.ServerModel }
// | { t: "flow"; c: Flow.ServerModel };

//
//
//
// Msg
//
//
//

export type ServerMsg = { t: "connect-four"; c: ConnectFour.ServerMsg };
// | { t: "tic-tac-toe"; c: TicTacToe.ServerMsg }
// | { t: "chess"; c: Chess.ServerMsg }
// | { t: "flow"; c: Flow.ServerMsg };

export type ClientMsg = { t: "connect-four"; c: ConnectFour.ClientMsg };
// | { t: "tic-tac-toe"; c: TicTacToe.ClientMsg }
// | { t: "chess"; c: Chess.ClientMsg }
// | { t: "flow"; c: Flow.ClientMsg };

export type ToClient = { t: "connect-four"; c: ConnectFour.ToClient };
// | { t: "tic-tac-toe"; c: TicTacToe.ToClient }
// | { t: "chess"; c: Chess.ToClient }
// | { t: "flow"; c: Flow.ToClient };

export type ToServer = { t: "connect-four"; c: ConnectFour.ToServer };
// | { t: "tic-tac-toe"; c: TicTacToe.ToServer }
// | { t: "chess"; c: Chess.ToServer }
// | { t: "flow"; c: Flow.ToServer };

//
//
//
// Game Name
//
//
//

export type GameName = "connect-four";

export const gameNames: { [gameName in GameName]: GameName } = {
  "connect-four": "connect-four",
  // "tic-tac-toe": "tic-tac-toe",
  // chess: "chess",
  // flow: "flow",
};

export const gameNameList: GameName[] = [
  "connect-four",
  // "chess",
  // "tic-tac-toe",
  // "flow",
];

export const gameNameToString = (gameName: GameName): string => {
  switch (gameName) {
    case "connect-four": {
      return "Connect Four";
    }

    // case "chess": {
    //   return "Chess";
    // }

    // case "tic-tac-toe": {
    //   return "Tic-Tac-Toe";
    // }

    // case "flow": {
    //   return "Flow";
    // }
  }
};

export type GameState = {
  t: "connect-four";
  c: ConnectFour.GameState;
};
// | {
//     t: "chess";
//     c: null;
//   }
// | {
//     t: "tic-tac-toe";
//     c: null;
//   }
// | {
//     t: "flow";
//     c: null;
//   };

export const initState = (gameName: GameName): GameState => {
  switch (gameName) {
    case "connect-four": {
      return {
        t: "connect-four",
        c: ConnectFour.initState(),
      };
    }
    // case "chess": {
    //   return {
    //     t: "chess",
    //     c: null,
    //   };
    // }

    // case "flow": {
    //   return {
    //     t: "flow",
    //     c: null,
    //   };
    // }

    // case "tic-tac-toe": {
    //   return {
    //     t: "tic-tac-toe",
    //     c: null,
    //   };
    // }
  }
};

export type GameEvent = { t: "connect-four"; c: ConnectFour.GameEvent };
// | { t: "chess"; c: null }
// | { t: "flow"; c: null }
// | { t: "tic-tac-toe"; c: null };

export const reducer = ({
  ctx,
  state,
  event,
}: {
  ctx: SpaceCtx;
  state: GameState;
  event: GameEvent;
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

  // if (state.t === "chess" && event.t === "chess") {
  //   return {
  //     t: "chess",
  //     c: null,
  //   };
  // }

  // if (state.t === "flow" && event.t === "flow") {
  //   return {
  //     t: "flow",
  //     c: null,
  //   };
  // }

  // if (state.t === "tic-tac-toe" && event.t === "tic-tac-toe") {
  //   return {
  //     t: "tic-tac-toe",
  //     c: null,
  //   };
  // }

  return state;
};
