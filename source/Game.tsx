import { Box, Collapse } from "@mui/material";
import { pipe } from "fp-ts/lib/function";
import { cmd, navigation, react } from "Framework";
import { Cmd } from "Framework/Cmd";
import React from "react";
import * as Route from "Route";
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

type Closed = { type: "Closed" };

type Opened = {
  type: "Opened";
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

const initOpened = ({ game }: { game: Game }): [Opened, Cmd<Msg>] => {
  return [
    { type: "Opened", child: initGame({ game }) },
    navigation.push(Route.encode({ type: "Game" })),
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
  | { type: "UserOpenedGame"; game: Game; groupGame: "None" }
  | { type: "UserClickedGameBanner"; groupGame: "None" }
  | (Games.Chess.Msg & { groupGame: "Chess" })
  | (Games.ConnectFour.Msg & { groupGame: "ConnectFour" })
  | (Games.TicTacToe.Msg & { groupGame: "TicTacToe" });

const groupGameTag =
  <Msg, GameName extends string>(gameName: GameName) =>
  (msg: Msg): Msg & { groupGame: GameName } => {
    return { ...msg, groupGame: gameName } as const;
  };

export const UserOpenedGame = (game: Game): GroupedMsg => {
  return {
    group: "Game",
    groupGame: "None",
    type: "UserOpenedGame",
    game,
  };
};

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (model.type) {
    case "Closed":
      return updateClosed(msg, model);

    case "Opened":
      return updateOpened(msg, model);
  }
};

const updateOpened = (msg: Msg, model: Opened): [Model, Cmd<Msg>] => {
  switch (msg.type) {
    case "UserOpenedGame":
      if (msg.game === model.child.type) {
        return [model, navigation.push(Route.encode({ type: "Game" }))];
      }
      return [model, cmd.none];

    case "UserClickedGameBanner":
      return [model, navigation.push(Route.encode({ type: "Game" }))];

    default:
      const [modelChild, cmdChild] = updateGame(msg, model.child);
      return [{ ...model, child: modelChild }, cmdChild];
  }
};

const updateGame = (
  msg: Msg,
  model: Opened["child"]
): [Opened["child"], cmd.Cmd<Msg>] => {
  if (model.type === "Chess" && msg.groupGame === "Chess") {
    const [modelChild, cmdChild] = Games.Chess.update(msg, model.child);
    return [
      { type: "Chess", child: modelChild },
      pipe(cmdChild, cmd.map(groupGameTag("Chess"))),
    ];
  }

  if (model.type === "ConnectFour" && msg.groupGame === "ConnectFour") {
    const [modelChild, cmdChild] = Games.ConnectFour.update(msg, model.child);
    return [
      { type: "ConnectFour", child: modelChild },
      pipe(cmdChild, cmd.map(groupGameTag("ConnectFour"))),
    ];
  }

  if (model.type === "TicTacToe" && msg.groupGame === "TicTacToe") {
    const [modelChild, cmdChild] = Games.TicTacToe.update(msg, model.child);
    return [
      { type: "TicTacToe", child: modelChild },
      pipe(cmdChild, cmd.map(groupGameTag("TicTacToe"))),
    ];
  }

  return [model, cmd.none];
};

const updateClosed = (msg: Msg, model: Closed): [Model, Cmd<Msg>] => {
  switch (msg.type) {
    case "UserOpenedGame":
      return initOpened(msg);

    default:
      return [model, cmd.none];
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
  (isOpen: boolean, model: Model): react.Html<Msg> =>
  (dispatch) =>
    (
      <Collapse in={isOpen && model.type === "Opened"}>
        <Box
          onClick={() =>
            dispatch({ type: "UserClickedGameBanner", groupGame: "None" })
          }
          sx={{
            width: "100%",
            paddingX: 2,
            paddingY: 1,
            backgroundColor: "primary.main",
          }}
        >
          <View.Typography>You're in a game...</View.Typography>
        </Box>
      </Collapse>
    );
