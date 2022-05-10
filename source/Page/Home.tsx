import { Avatar, Box, ButtonBase, Toolbar, Typography } from "@mui/material";
import React from "react";
import { cmd, react } from "../Framework";
import * as Routes from "../Routes";
import * as View from "../View";
import * as Game from "../Game";

//
//
//
//
// Model
//
//
//
//

export type Model = {};

export const init: Model = {};

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
  | { group: "Home"; type: "ClickedAvatar" }
  | {
      type: "ClickedGame";
      game: "TicTacToe" | "ConnectFour" | "Chess";
    };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ClickedAvatar":
      return [model, Routes.push({ type: "Account" })];

    case "ClickedGame":
      switch (msg.game) {
        case "ConnectFour":
          return [model, Routes.push({ type: "ConnectFour" })];

        case "TicTacToe":
          return [model, Routes.push({ type: "TicTacToe" })];

        case "Chess":
          return [model, Routes.push({ type: "Chess" })];
      }
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
  ({ avatarUrl }: { avatarUrl: string }, _model: Model): react.Html<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            Gamezilla
          </Typography>

          <Avatar
            onClick={() => dispatch({ group: "Home", type: "ClickedAvatar" })}
            src={avatarUrl}
          />
        </Toolbar>

        <Box
          sx={{
            p: 2,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
          }}
        >
          <GameIcon
            icon={<Game.TicTacToe.Icon />}
            label="Tic Tac Toe"
            onClick={() =>
              dispatch({
                type: "ClickedGame",
                game: "TicTacToe",
              })
            }
          />

          <GameIcon
            icon={<Game.ConnectFour.Icon />}
            label="Connect Four"
            onClick={() =>
              dispatch({
                type: "ClickedGame",
                game: "ConnectFour",
              })
            }
          />

          <GameIcon
            icon={<Game.Chess.Icon />}
            label="Chess"
            onClick={() => dispatch({ type: "ClickedGame", game: "Chess" })}
          />
        </Box>
      </View.Page>
    );

const GameIcon = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => {
  return (
    <Box>
      <ButtonBase
        onClick={onClick}
        sx={{ overflow: "hidden", borderRadius: 5 }}
      >
        {icon}
      </ButtonBase>
      <Typography sx={{ marginTop: 1 }} align="center">
        {label}
      </Typography>
    </Box>
  );
};
