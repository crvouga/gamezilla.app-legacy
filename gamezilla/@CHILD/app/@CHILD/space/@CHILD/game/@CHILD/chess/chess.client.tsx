import { MainMenuScreen } from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED/game";
import {
  GameClient,
  SpaceClientCtx,
  SpaceClientEvt,
  SpaceViewCtx,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import {
  APP_SOUND,
  ClientCmd,
  playSound,
  preloadSound,
  sendToServer,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { IconPuzzlePiece } from "gamezilla/@CHILD/app/@SHARED/ui";
import { Eff, RemoteResult, Sub, chain, isErr } from "gamezilla/@SHARED/core";
import * as Puzzle from "./@CHILD/puzzle/puzzle.client";
import * as VsBot from "./@CHILD/vs-bot/vs-bot.client";
import * as VsUser from "./@CHILD/vs-user/vs-user.client";
import { CoverArt } from "./@SHARED/chess-ui";
import { CHESS_SOUND } from "./@SHARED/chess/chess-sounds";
import {
  ClientModel,
  ClientMsg,
  GameEvent,
  GameState,
  ToClient,
  ToServer,
} from "./chess.core";

//
//
//
//
//
//

type Client = GameClient<{
  ClientModel: ClientModel;
  ClientMsg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  ClientCtx: SpaceClientCtx;
  ViewCtx: SpaceViewCtx;
  GameEvent: GameEvent;
  GameState: GameState;
  ClientCmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>;
  ClientEvt: SpaceClientEvt;
}>;

//
//
//
// Model
//
//
//

export const init: Client["init"] = ({ model }) => {
  if (model) {
    return { model };
  }

  return {
    model: {
      mode: { t: "none" },
      requests: {},
    },
    cmd: [preloadSound(Object.values(CHESS_SOUND))],
  };
};

//
//
//
// Update
//
//
//

export const update: Client["update"] = (input) => {
  return chain(
    init(input),
    //
    (model) => {
      const { msg, ctx } = input;
      if (!msg) {
        return { model };
      }
      switch (msg.t) {
        case "input-mode": {
          return {
            model: {
              ...model,
              requests: { ...model.requests, [msg.t]: RemoteResult.loading },
            },
            cmd: [sendToServer(msg)],
          };
        }

        case "vs-user": {
          if (model.mode?.t === "vs-user") {
            const updated = VsUser.update(msg.c, model.mode.c);

            return {
              model: { ...model, mode: { t: "vs-user", c: updated.model } },
              eff: Eff.t("vs-user", updated.eff),
            };
          }

          return { model };
        }

        case "vs-bot": {
          if (model.mode?.t === "vs-bot") {
            const updated = VsBot.update({
              msg: msg.c,
              model: model.mode.c,
              ctx,
            });

            return {
              model: { ...model, mode: { t: "vs-bot", c: updated.model } },
              eff: Eff.t("vs-bot", updated.eff),
            };
          }

          return { model };
        }

        case "puzzle": {
          if (model.mode?.t === "puzzle") {
            const updated = Puzzle.update({
              ctx,
              model: model.mode.c,
              msg: msg.c,
            });

            return {
              model: {
                ...model,
                mode: { t: "puzzle", c: updated.model },
              },
              eff: Eff.t("puzzle", updated?.eff ?? Eff.None),
              cmd: ClientCmd.tag("puzzle", updated.cmd),
            };
          }
          return { model };
        }
      }
    },
    (model) => {
      const { serverMsg, ctx } = input;

      if (!serverMsg) {
        return { model };
      }

      switch (serverMsg.t) {
        case "input-mode": {
          return chain(
            { model },
            (model) => {
              const { result } = serverMsg;

              const modelNew: ClientModel = {
                ...model,
                requests: {
                  ...model.requests,
                  [serverMsg.t]: RemoteResult.map(result, () => null),
                },
              };

              if (isErr(result)) {
                return { model: modelNew };
              }

              return { model: modelNew };
            },

            (model) => {
              if (model.mode.t === "none") {
                return { model, cmd: [playSound(APP_SOUND.navBackwardMin)] };
              }
              return { model, cmd: [playSound(APP_SOUND.navForwardMin)] };
            }
          );
        }

        case "vs-user": {
          if (model?.mode?.t === "vs-user") {
            const [child, eff] = VsUser.updateFromServer(
              { ctx },
              serverMsg.c,
              model.mode.c
            );

            return {
              model: { ...model, mode: { t: "vs-user", c: child } },
              eff: Eff.t("vs-user", eff),
            };
          }

          return { model };
        }

        case "vs-bot": {
          if (model?.mode?.t === "vs-bot") {
            const updated = VsBot.updateFromServer({
              msg: serverMsg.c,
              model: model.mode.c,
            });

            return {
              model: { ...model, mode: { t: "vs-bot", c: updated.model } },
              eff: Eff.t("vs-bot", updated.eff),
            };
          }

          return { model };
        }

        case "puzzle": {
          if (model?.mode?.t !== "puzzle") {
            return { model };
          }

          const updated = Puzzle.updateFromServer({
            ctx,
            model: model.mode.c,
            msg: serverMsg.c,
          });

          return {
            model: { ...model, mode: { t: "puzzle", c: updated.model } },
            eff: Eff.t("puzzle", updated?.eff ?? Eff.None),
            cmd: ClientCmd.tag("puzzle", updated.cmd),
          };
        }
      }
    }
  );
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Client["subscriptions"] = (_input) => {
  return Sub.None;
};

//
//
//
// View
//
//
//

export const View: Client["View"] = ({ ctx, state, dispatch }) => {
  switch (state.t) {
    case "none": {
      return (
        <MainMenuScreen.View
          title="Chess"
          ctx={ctx}
          renderCoverArt={(props) => <CoverArt {...props} />}
          buttons={[
            MainMenuScreen.buttons.playComputer({
              onClick: () =>
                dispatch({
                  t: "input-mode",
                  mode: "vs-bot",
                  userId: ctx.currentUserId,
                }),
            }),
            MainMenuScreen.buttons.playFriend({
              onClick: () =>
                dispatch({
                  t: "input-mode",
                  mode: "vs-user",
                  userId: ctx.currentUserId,
                }),
            }),
            {
              title: "Puzzles",
              description: "Train with more than 3 million puzzles",
              renderIcon: (props) => <IconPuzzlePiece {...props} />,
              onClick: () =>
                dispatch({
                  t: "input-mode",
                  mode: "puzzle",
                  userId: ctx.currentUserId,
                }),
            },
          ]}
        />
      );
    }

    case "vs-bot": {
      return null;
      // return (
      //   <VsBot.View
      //     ctx={ctx}
      //     dispatch={(c) => dispatch({ t: "vs-bot", c })}
      //     model={model?.mode.c}
      //     onClose={() => {
      //       dispatch({
      //         t: "input-mode",
      //         mode: "none",
      //         userId: ctx.currentUserId,
      //       });
      //     }}
      //   />
      // );
    }

    case "vs-user": {
      return null;
      // return (
      //   <VsUser.View
      //     ctx={ctx}
      //     model={model.mode.c}
      //     dispatch={(c) => dispatch({ t: "vs-user", c })}
      //     onQuit={() => {
      //       dispatch({
      //         t: "input-mode",
      //         mode: "none",
      //         userId: ctx.currentUserId,
      //       });
      //     }}
      //   />
      // );
    }

    case "puzzle": {
      return null;
      // return (
      //   <Puzzle.View
      //     ctx={ctx}
      //     model={model.mode.c}
      //     dispatch={(c) => dispatch({ t: "puzzle", c })}
      //     onClose={() => {
      //       dispatch({
      //         t: "input-mode",
      //         mode: "none",
      //         userId: ctx.currentUserId,
      //       });
      //     }}
      //   />
      // );
    }
  }
};

export const ViewFeedItem: Client["ViewFeedItem"] = () => {
  return null
}
