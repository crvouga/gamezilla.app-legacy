import * as Games from "./Games";

export type Game =
  | { type: "TicTacToe"; child: Games.TicTacToe.Board }
  | { type: "ConnectFour"; child: Games.ConnectFour.IColumns };
