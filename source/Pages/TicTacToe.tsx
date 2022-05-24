import { Button } from "@mui/material";
import { cmd, navigation, react } from "Framework";
import { Cmd } from "Framework/Cmd";
import React from "react";
import { Group } from "Utility";
import * as Game from "../Games";
import * as View from "../View";

//
//
//
// Model
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
// Update
//
//
//

export type Msg =
  | { type: "PressedBackButton" }
  | { type: "BoardClicked"; position: Game.TicTacToe.Position }
  | { type: "RestartButtonClicked" };

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg.type) {
    case "PressedBackButton":
      return [model, navigation.back()];

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
// View
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
              onClick={() => dispatch({ type: "PressedBackButton" })}
            />
          }
          title="Tic Tac Toe"
        />
        <Game.TicTacToe.Board
          board={model.board}
          onClick={(position) => dispatch({ type: "BoardClicked", position })}
        />

        <Button
          size="large"
          fullWidth
          onClick={() => dispatch({ type: "RestartButtonClicked" })}
        >
          Restart
        </Button>
      </View.Page>
    );
