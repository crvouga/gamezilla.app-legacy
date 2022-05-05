import { Avatar, Box, Toolbar, Typography } from "@mui/material";
import React from "react";
import { cmd, react } from "../Framework";
import * as Routes from "../Router";
import * as TicTacToe from "../TicTacToe";
import * as ConnectFour from "../ConnectFour";

/* 


Model


*/

export type Model = {};

export const init: Model = {};

/* 


Update


*/

export type Msg =
  | { type: "ClickedAvatar" }
  | { type: "ClickedGame"; game: "TicTacToe" | "ConnectFour" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ClickedAvatar":
      return [model, Routes.push("Account")];

    case "ClickedGame":
      switch (msg.game) {
        case "ConnectFour":
          return [model, Routes.push("ConnectFour")];

        case "TicTacToe":
          return [model, Routes.push("TicTacToe")];
      }
  }
};

/* 


View


*/

export const view =
  ({ avatarUrl }: { avatarUrl: string }, _model: Model): react.Html<Msg> =>
  (dispatch) =>
    (
      <Box
        sx={{
          position: "fixed",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            Gamezilla
          </Typography>

          <Avatar
            onClick={() => dispatch({ type: "ClickedAvatar" })}
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
            icon={<TicTacToe.Icon />}
            label="Tic Tac Toe"
            onClick={() => dispatch({ type: "ClickedGame", game: "TicTacToe" })}
          />
          <GameIcon
            icon={<ConnectFour.Icon />}
            label="Connect Four"
            onClick={() =>
              dispatch({ type: "ClickedGame", game: "ConnectFour" })
            }
          />
        </Box>
      </Box>
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
    <Box onClick={onClick}>
      <Box sx={{ overflow: "hidden" }}>{icon}</Box>
      <Typography align="center" variant="subtitle2">
        {label}
      </Typography>
    </Box>
  );
};
