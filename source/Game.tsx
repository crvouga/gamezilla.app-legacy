import * as Games from "./Games";

//
//
//
// Model
//
//
//

export type Model = Closed | Opened;

type Closed = { type: "Closed" };

type Opened = {
  type: "Opened";
  child:
    | { type: "TicTacToe"; child: Games.TicTacToe.Board }
    | { type: "ConnectFour"; child: Games.ConnectFour.IColumns };
};

type Game = Opened["child"]["type"];

//
// init
//

export const init: Model = { type: "Closed" };

//
//
//
// Update
//
//
//

export type Msg = { type: "UserOpenedGame"; game: Game };
