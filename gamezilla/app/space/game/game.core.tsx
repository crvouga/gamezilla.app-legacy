import * as Chess from "./chess";
import * as ConnectFour from "./connect-four";
import * as Flow from "./flow";
import * as TicTacToe from "./tic-tac-toe";

//
//
//
// Model
//
//
//

export type ClientModel =
  | { t: "tic-tac-toe"; c: TicTacToe.ClientModel }
  | { t: "connect-four"; c: ConnectFour.ClientModel }
  | { t: "chess"; c: Chess.ClientModel }
  | { t: "flow"; c: Flow.ClientModel };

export type ServerModel =
  | { t: "tic-tac-toe"; c: TicTacToe.ServerModel }
  | { t: "connect-four"; c: ConnectFour.ServerModel }
  | { t: "chess"; c: Chess.ServerModel }
  | { t: "flow"; c: Flow.ServerModel };

//
//
//
// Msg
//
//
//

export type ServerMsg =
  | { t: "tic-tac-toe"; c: TicTacToe.ServerMsg }
  | { t: "connect-four"; c: ConnectFour.ServerMsg }
  | { t: "chess"; c: Chess.ServerMsg }
  | { t: "flow"; c: Flow.ServerMsg };

export type ClientMsg =
  | { t: "tic-tac-toe"; c: TicTacToe.ClientMsg }
  | { t: "connect-four"; c: ConnectFour.ClientMsg }
  | { t: "chess"; c: Chess.ClientMsg }
  | { t: "flow"; c: Flow.ClientMsg };

export type ToClient =
  | { t: "tic-tac-toe"; c: TicTacToe.ToClient }
  | { t: "connect-four"; c: ConnectFour.ToClient }
  | { t: "chess"; c: Chess.ToClient }
  | { t: "flow"; c: Flow.ToClient };

export type ToServer =
  | { t: "tic-tac-toe"; c: TicTacToe.ToServer }
  | { t: "connect-four"; c: ConnectFour.ToServer }
  | { t: "chess"; c: Chess.ToServer }
  | { t: "flow"; c: Flow.ToServer };

//
//
//
// Game Name
//
//
//

export type GameName = ServerModel["t"];

export const gameNames: { [gameName in GameName]: GameName } = {
  "tic-tac-toe": "tic-tac-toe",
  "connect-four": "connect-four",
  chess: "chess",
  flow: "flow",
};

export const gameNameList: GameName[] = [
  "chess",
  "connect-four",
  "tic-tac-toe",
  "flow",
];

//
//
//
//
//

export const ViewCoverArt = ({ gameName }: { gameName: GameName }) => {
  switch (gameName) {
    case "chess": {
      return <Chess.ViewCoverArt />;
    }

    case "connect-four": {
      return <ConnectFour.ViewCoverArt />;
    }

    case "tic-tac-toe": {
      return <TicTacToe.ViewCoverArt />;
    }

    case "flow": {
      return <Flow.ViewCoverArt />;
    }

    default: {
      const check: never = gameName;
      return check;
    }
  }
};

export const gameNameToString = (gameName: GameName): string => {
  switch (gameName) {
    case "chess": {
      return "Chess";
    }

    case "connect-four": {
      return "Connect Four";
    }

    case "tic-tac-toe": {
      return "Tic-Tac-Toe";
    }

    case "flow": {
      return "Flow";
    }
  }
};
