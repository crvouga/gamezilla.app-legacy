import { Close } from "@mui/icons-material";
import { Box, ButtonBase } from "@mui/material";
import { pipe } from "fp-ts/lib/function";
import { cmd, navigation, react } from "Framework";
import { Cmd } from "Framework/Cmd";
import React from "react";
import * as Route from "Route";
import * as Snackbar from "Snackbar";
import * as View from "View";
import * as Games from "./Games";

//
//
//
// Model
//
//
//

export type Model = Closed | Opened;

type Closed = {
  type: "Closed";
};

type Opened = {
  type: "Opened";
  status: "Idle" | "ConfirmingClose";
  child:
    | { type: "TicTacToe"; child: Games.TicTacToe.Model }
    | { type: "ConnectFour"; child: Games.ConnectFour.Model }
    | { type: "Chess"; child: Games.Chess.Model };
};

export type Game = Opened["child"]["type"];

//
// init
//

export const init: Model = { type: "Closed" };

const initOpened = ({ game }: { game: Game }): [Opened, Cmd<Msg>, OutMsg[]] => {
  return [
    { type: "Opened", status: "Idle", child: initGame({ game }) },
    navigation.push(Route.encode({ type: "Game" })),
    [],
  ];
};

const initGame = ({ game }: { game: Game }): Opened["child"] => {
  switch (game) {
    case "Chess":
      return { type: "Chess", child: Games.Chess.init };

    case "ConnectFour":
      return { type: "ConnectFour", child: Games.ConnectFour.init };

    case "TicTacToe":
      return { type: "TicTacToe", child: Games.TicTacToe.init };
  }
};

//
//
//
// Update
//
//
//

export type GroupedMsg = { group: "Game" } & Msg;

type Msg =
  | { type: "UserOpenedGame"; game: Game }
  | { type: "UserClickedGameBanner" }
  | { type: "UserClickedCloseGameButton" }
  | { type: "CancelledCloseGame" }
  | { type: "ConfirmedCloseGame" }
  | GameMsg;

type GameMsg =
  | (Games.Chess.Msg & { gameGroup: "Chess" })
  | (Games.ConnectFour.Msg & { gameGroup: "ConnectFour" })
  | (Games.TicTacToe.Msg & { gameGroup: "TicTacToe" });

type OutMsg = Snackbar.GroupedMsg;

const groupGameTag =
  <Msg, GameName extends string>(gameName: GameName) =>
  (msg: Msg): Msg & { gameGroup: GameName } => {
    return { ...msg, gameGroup: gameName } as const;
  };

export const UserOpenedGame = (game: Game): GroupedMsg => {
  return {
    group: "Game",
    type: "UserOpenedGame",
    game,
  };
};

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>, OutMsg[]] => {
  switch (model.type) {
    case "Closed":
      return updateClosed(msg, model);

    case "Opened":
      return updateOpened(msg, model);
  }
};

const updateOpened = (msg: Msg, model: Opened): [Model, Cmd<Msg>, OutMsg[]] => {
  if ("gameGroup" in msg) {
    const [modelChild, cmdChild] = updateGame(msg, model.child);

    return [{ ...model, child: modelChild }, cmdChild, []];
  }

  switch (msg.type) {
    case "UserOpenedGame":
      if (msg.game === model.child.type) {
        return [model, navigation.push(Route.encode({ type: "Game" })), []];
      }
      return [
        model,
        cmd.none,
        [Snackbar.EnqueuedSnackbar("A game is already opened.")],
      ];

    case "UserClickedCloseGameButton":
      return [{ ...model, status: "ConfirmingClose" }, cmd.none, []];

    case "UserClickedGameBanner":
      return [model, navigation.push(Route.encode({ type: "Game" })), []];

    case "CancelledCloseGame":
      return [{ ...model, status: "Idle" }, cmd.none, []];

    case "ConfirmedCloseGame":
      return [{ type: "Closed" }, cmd.none, []];
  }
};

const updateGame = (
  msg: GameMsg,
  model: Opened["child"]
): [Opened["child"], cmd.Cmd<Msg>] => {
  if (model.type === "Chess" && msg.gameGroup === "Chess") {
    const [modelChild, cmdChild] = Games.Chess.update(msg, model.child);
    return [
      { type: "Chess", child: modelChild },
      pipe(cmdChild, cmd.map(groupGameTag("Chess"))),
    ];
  }

  if (model.type === "ConnectFour" && msg.gameGroup === "ConnectFour") {
    const [modelChild, cmdChild] = Games.ConnectFour.update(msg, model.child);
    return [
      { type: "ConnectFour", child: modelChild },
      pipe(cmdChild, cmd.map(groupGameTag("ConnectFour"))),
    ];
  }

  if (model.type === "TicTacToe" && msg.gameGroup === "TicTacToe") {
    const [modelChild, cmdChild] = Games.TicTacToe.update(msg, model.child);
    return [
      { type: "TicTacToe", child: modelChild },
      pipe(cmdChild, cmd.map(groupGameTag("TicTacToe"))),
    ];
  }

  return [model, cmd.none];
};

const updateClosed = (msg: Msg, model: Closed): [Model, Cmd<Msg>, OutMsg[]] => {
  switch (msg.type) {
    case "UserOpenedGame":
      return initOpened(msg);

    default:
      return [model, cmd.none, []];
  }
};

//
//
//
// View
//
//
//

export const view = (model: Model): react.Html<Msg> => {
  switch (model.type) {
    case "Closed":
      return viewClosed;

    case "Opened":
      return viewOpened(model);
  }
};

const viewOpened = (model: Opened): react.Html<Msg> => {
  switch (model.child.type) {
    case "Chess":
      return pipe(
        Games.Chess.view(model.child.child),
        react.map(groupGameTag("Chess"))
      );

    case "ConnectFour":
      return pipe(
        Games.ConnectFour.view(model.child.child),
        react.map(groupGameTag("ConnectFour"))
      );

    case "TicTacToe":
      return pipe(
        Games.TicTacToe.view(model.child.child),
        react.map(groupGameTag("TicTacToe"))
      );
  }
};

const viewClosed: react.Html<Msg> = () => {
  return <>game is closed</>;
};

export const viewBanner =
  (model: Opened): react.Html<Msg> =>
  (dispatch) =>
    (
      <>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ButtonBase
            onClick={() => dispatch({ type: "UserClickedGameBanner" })}
          >
            <Box sx={{ width: "20%", marginRight: 2 }}>
              <GameIcon game={model.child.type} />
            </Box>
            <View.Typography align="left" sx={{ flex: 1 }}>
              {gameToName(model.child.type)}
            </View.Typography>
          </ButtonBase>
          <ButtonBase
            sx={{ width: "15%", height: "100%", p: 2 }}
            onClick={() =>
              dispatch({
                type: "UserClickedCloseGameButton",
              })
            }
          >
            <Close />
          </ButtonBase>
        </Box>

        <View.ConformationDialog
          open={model.status === "ConfirmingClose"}
          title={`Close ${gameToName(model.child.type)}?`}
          confirmTitle="Close Game"
          onClose={() => dispatch({ type: "CancelledCloseGame" })}
          onCancel={() => dispatch({ type: "CancelledCloseGame" })}
          onConfirm={() => dispatch({ type: "ConfirmedCloseGame" })}
        />
      </>
    );

export const gameToName = (game: Game): string => {
  switch (game) {
    case "Chess":
      return "Chess";

    case "ConnectFour":
      return "Connect Four";

    case "TicTacToe":
      return "Tic Tac Toe";
  }
};

const GameIcon = ({ game }: { game: Game }) => {
  switch (game) {
    case "Chess":
      return <Games.Chess.Icon />;

    case "ConnectFour":
      return <Games.ConnectFour.Icon />;

    case "TicTacToe":
      return <Games.TicTacToe.Icon />;
  }
};
