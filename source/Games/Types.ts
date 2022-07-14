import * as Chess from "./Chess";
import * as ConnectFour from "./ConnectFour";
import * as Snake from "./Snake";
import * as TicTacToe from "./TicTacToe";

export type BackendModel = {
  ticTacToe: TicTacToe.BackendModel;
};

export type FrontendModel = Closed | Opened;

export type ToFrontend = ["TicTacToe", TicTacToe.ToFrontend];

export type ToBackend = ["TicTacToe", TicTacToe.ToBackend];

export type BackendMsg = ["TicTacToe", TicTacToe.BackendMsg];

export type FrontendMsg =
  | ["ConfirmedClose"]
  | ["CancelledClose"]
  | ["ClickedClose"]
  | ["ClickedBanner"]
  | ["Chess", Chess.Msg]
  | ["ConnectFour", ConnectFour.Msg]
  | ["Snake", Snake.Msg]
  | ["TicTacToe", TicTacToe.FrontendMsg];

//
//
//
//
//

export type Closed = { type: "Closed" };

export type Opened = {
  type: "Opened";
  status: "Idle" | "ConfirmingClose";
  child:
    | { type: "TicTacToe"; child: TicTacToe.FrontendModel }
    | { type: "ConnectFour"; child: ConnectFour.Model }
    | { type: "Chess"; child: Chess.Model }
    | { type: "Snake"; child: Snake.Model };
};

export type GameName = Opened["child"]["type"];
