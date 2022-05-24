import React from "react";
import { cmd, navigation, react } from "Framework";
import { Cmd } from "Framework/Cmd";
import * as Games from "./Games";
import * as Route from "Route";
import { groupTag } from "Utility";
import { pipe } from "fp-ts/lib/function";

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
  | { type: "UserOpenedGame"; game: Game; gameTag: "None" }
  | (Games.Chess.Msg & { gameTag: "Chess" })
  | (Games.ConnectFour.Msg & { gameTag: "ConnectFour" })
  | (Games.TicTacToe.Msg & { gameTag: "TicTacToe" });

const gameTag =
  <Msg, GameName extends string>(game: GameName) =>
  (msg: Msg): Msg & { gameTag: GameName } => {
    return { ...msg, gameTag: game } as const;
  };

export const UserOpenedGame = (game: Game): GroupedMsg => {
  return {
    group: "Game",
    gameTag: "None",
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

    default:
      const [modelChild, cmdChild] = updateGame(msg, model.child);
      return [{ ...model, child: modelChild }, cmdChild];
  }
};

const updateGame = (
  msg: Msg,
  model: Opened["child"]
): [Opened["child"], cmd.Cmd<Msg>] => {
  if (model.type === "Chess" && msg.gameTag === "Chess") {
    const [modelChild, cmdChild] = Games.Chess.update(msg, model.child);
    return [
      { type: "Chess", child: modelChild },
      pipe(cmdChild, cmd.map(gameTag("Chess"))),
    ];
  }

  if (model.type === "ConnectFour" && msg.gameTag === "ConnectFour") {
    const [modelChild, cmdChild] = Games.ConnectFour.update(msg, model.child);
    return [
      { type: "ConnectFour", child: modelChild },
      pipe(cmdChild, cmd.map(gameTag("ConnectFour"))),
    ];
  }

  if (model.type === "TicTacToe" && msg.gameTag === "TicTacToe") {
    const [modelChild, cmdChild] = Games.TicTacToe.update(msg, model.child);
    return [
      { type: "TicTacToe", child: modelChild },
      pipe(cmdChild, cmd.map(gameTag("TicTacToe"))),
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
        react.map(gameTag("Chess"))
      );

    case "ConnectFour":
      return pipe(
        Games.ConnectFour.view(model.child.child),
        react.map(gameTag("ConnectFour"))
      );

    case "TicTacToe":
      return pipe(
        Games.TicTacToe.view(model.child.child),
        react.map(gameTag("TicTacToe"))
      );
  }
};

const viewClosed: react.Html<Msg> = () => {
  return <>game is closed</>;
};
