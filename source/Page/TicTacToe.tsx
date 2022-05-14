import { Button } from "@mui/material";
import React from "react";
import { cmd, react } from "../Framework";
import * as Routes from "../Routes";
import * as Game from "../Game";
import * as View from "../View";

//
//
//
//
// Model
//
//
//
//

export type Model = {
  board: Game.TicTacToe.Board;
};

export const init: Model = {
  board: Game.TicTacToe.emptyBoard,
};

//
//
//
//
// Update
//
//
//
//

export type Msg =
  | { group: "TicTacToe"; type: "Back" }
  | {
      group: "TicTacToe";
      type: "BoardClicked";
      position: Game.TicTacToe.Position;
    }
  | { group: "TicTacToe"; type: "RestartButtonClicked" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Back":
      return [model, Routes.replace({ type: "Home" })];

    case "RestartButtonClicked":
      return [
        {
          ...model,
          board: Game.TicTacToe.emptyBoard,
        },
        cmd.none,
      ];

    case "BoardClicked":
      return [
        {
          ...model,
          board: Game.TicTacToe.move(
            model.board,
            Game.TicTacToe.toTurn(model.board),
            msg.position
          ),
        },
        cmd.none,
      ];
  }
};

//
//
//
//
// View
//
//
//
//

export const view =
  (model: Model): react.Html<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() => dispatch({ group: "TicTacToe", type: "Back" })}
            />
          }
          title="Tic Tac Toe"
        />
        <Game.TicTacToe.Board
          board={model.board}
          onClick={(position) =>
            dispatch({ group: "TicTacToe", type: "BoardClicked", position })
          }
        />

        <Button
          size="large"
          fullWidth
          onClick={() =>
            dispatch({ group: "TicTacToe", type: "RestartButtonClicked" })
          }
        >
          Restart
        </Button>
      </View.Page>
    );
