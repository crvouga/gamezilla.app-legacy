import { Avatar, Box, ButtonBase, Toolbar, Typography } from "@mui/material";
import React from "react";
import { cmd, navigation, react } from "Framework";
import * as Games from "../Games";
import * as Game from "Game";
import * as Route from "Route";
import * as View from "../View";

//
//
//
// Model
//
//
//

export type Model = {};

export const init: Model = {};

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "UserClickedAvatar" }
  | { type: "UserClickedGame"; game: Game.Game };

export type OutMsg = Game.GroupedMsg;

export const update = (
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>, OutMsg[]] => {
  switch (msg.type) {
    case "UserClickedAvatar":
      return [model, navigation.push(Route.encode({ type: "Account" })), []];

    case "UserClickedGame":
      return [model, cmd.none, [Game.UserOpenedGame(msg.game)]];
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
  ({ avatarUrl }: { avatarUrl: string }, _model: Model): react.Html<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            Gamezilla
          </Typography>

          <Avatar
            onClick={() => dispatch({ type: "UserClickedAvatar" })}
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
            icon={<Games.TicTacToe.Icon />}
            label="Tic Tac Toe"
            onClick={() =>
              dispatch({
                type: "UserClickedGame",
                game: "TicTacToe",
              })
            }
          />

          <GameIcon
            icon={<Games.ConnectFour.Icon />}
            label="Connect Four"
            onClick={() =>
              dispatch({
                type: "UserClickedGame",
                game: "ConnectFour",
              })
            }
          />

          <GameIcon
            icon={<Games.Chess.Icon />}
            label="Chess"
            onClick={() => dispatch({ type: "UserClickedGame", game: "Chess" })}
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
