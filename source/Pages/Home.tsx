import {
  Avatar,
  Box,
  ButtonBase,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { cmd, navigation, react } from "Framework";
import * as Game from "Game";
import React from "react";
import * as Route from "Route";
import * as Games from "../Games";
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

const isOpen = (game: Game.Model, gameName: Game.Game) => {
  return game.type === "Opened" && game.child.type === gameName;
};

const canOpen = (game: Game.Model, gameName: Game.Game) => {
  return game.type === "Closed" || isOpen(game, gameName);
};

export const view =
  (
    { profile, game }: { profile: { avatarUrl: string }; game: Game.Model },
    _model: Model
  ): react.Html<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            Gamezilla
          </Typography>

          <Avatar
            onClick={() => dispatch({ type: "UserClickedAvatar" })}
            src={profile.avatarUrl}
          />
        </Toolbar>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
          }}
        >
          <GameCard
            icon={<Games.TicTacToe.Icon />}
            label="Tic Tac Toe"
            disabled={!canOpen(game, "TicTacToe")}
            onClick={() =>
              dispatch({
                type: "UserClickedGame",
                game: "TicTacToe",
              })
            }
          />

          <GameCard
            icon={<Games.ConnectFour.Icon />}
            label="Connect Four"
            disabled={!canOpen(game, "ConnectFour")}
            onClick={() =>
              dispatch({
                type: "UserClickedGame",
                game: "ConnectFour",
              })
            }
          />

          <GameCard
            icon={<Games.Chess.Icon />}
            label="Chess"
            disabled={!canOpen(game, "Chess")}
            onClick={() => dispatch({ type: "UserClickedGame", game: "Chess" })}
          />
        </Box>
      </View.Page>
    );

const GameCard = ({
  icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) => {
  // const theme = useTheme();
  return (
    <ButtonBase
      disabled={disabled}
      sx={{
        position: "relative",
        overflow: "hidden",
        opacity: disabled ? 0.3 : 1,
        // border: `4px solid ${theme.palette.primary.main}`,
        // borderRadius: "2px",
      }}
      onClick={onClick}
    >
      {icon}

      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <Box
          sx={{
            width: "100%",
            padding: 1,
            paddingTop: 2,
            background: `linear-gradient(transparent, rgba(0, 0, 0, 0.6))`,
          }}
        >
          <Typography align="left" fontWeight={800}>
            {label}
          </Typography>
        </Box>
      </Box>
    </ButtonBase>
  );
};
