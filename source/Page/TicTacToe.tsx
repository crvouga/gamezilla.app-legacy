import React from "react";
import { cmd, react } from "../Framework";
import * as Routes from "../Routes";
import * as View from "../View";
import * as TicTacToe from "../TicTacToe";
import { Box, Button } from "@mui/material";

/* 


Model


*/

export type Model = {
  board: TicTacToe.Board;
};

export const init: Model = {
  board: TicTacToe.emptyBoard,
};

/* 


Update


*/

export type Msg =
  | { type: "Back" }
  | { type: "BoardClicked"; position: TicTacToe.Position }
  | { type: "RestartButtonClicked" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Back":
      return [model, Routes.replace({ type: "Home" })];

    case "RestartButtonClicked":
      return [
        {
          ...model,
          board: TicTacToe.emptyBoard,
        },
        cmd.none,
      ];

    case "BoardClicked":
      return [
        {
          ...model,
          board: TicTacToe.move(
            model.board,
            TicTacToe.toTurn(model.board),
            msg.position
          ),
        },
        cmd.none,
      ];
  }
};

/* 


View


*/

export const view =
  (model: Model): react.Html<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton onClick={() => dispatch({ type: "Back" })} />
          }
          title="Tic Tac Toe"
        />
        <TicTacToe.Board
          board={model.board}
          onClick={(position) => dispatch({ type: "BoardClicked", position })}
        />
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            sx={{
              borderColor: TicTacToe.theme.background,
              color: TicTacToe.theme.background,
              fontWeight: 800,
            }}
            variant="outlined"
            onClick={() => dispatch({ type: "RestartButtonClicked" })}
          >
            Restart
          </Button>
        </Box>
      </View.Page>
    );
