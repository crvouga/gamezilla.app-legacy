import { Eff, RemoteResult, Sub, andThen, p } from "gamezilla/@SHARED/core";
import {
  APP_SOUND,
  ClientCmd,
  playSound,
  preloadSound,
  sendToServer,
} from "gamezilla/app/@SHARED/client";
import { IconPuzzlePiece } from "gamezilla/app/@SHARED/ui";
import { SpaceGameClient } from "gamezilla/app/space/@SHARED";
import {
  MainMenuScreen,
  mainMenuButtons,
} from "gamezilla/app/space/game/@SHARED";
import { ViewCoverArt } from "./@SHARED/chess-ui";
import { CHESS_SOUND } from "./@SHARED/chess/chess-sounds";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
} from "./chess.core";
import * as Puzzle from "./puzzle/puzzle.client";
import * as VsBot from "./vs-bot/vs-bot.client";
import * as VsUser from "./vs-user/vs-user.client";

type Client = SpaceGameClient<
  ClientModel,
  ServerModel,
  ClientMsg,
  ToClient,
  ToServer
>;

//
//
//
// Model
//
//
//

export const init: Client["init"] = () => {
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

export const update: Client["update"] = ({ msg, model, ctx }) => {
  switch (msg.t) {
    case "input-mode": {
      return {
        model: {
          ...model,
          requests: { ...model.requests, [msg.t]: RemoteResult.Loading },
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
};

export const updateFromServer: Client["updateFromServer"] = ({
  ctx,
  msg,
  model,
}) => {
  switch (msg.t) {
    case "input-mode": {
      return p(
        {
          model,
        },
        andThen((model) => {
          const { result } = msg;

          const modelNew: ClientModel = {
            ...model,
            requests: {
              ...model.requests,
              [msg.t]: RemoteResult.map(result, () => null),
            },
          };

          if (result.t === "err") {
            return { model: modelNew };
          }

          const merged = mergeWithServer({
            ctx,
            client: modelNew,
            server: result.value,
          });

          return merged;
        }),
        andThen((model) => {
          if (model.mode.t === "none") {
            return { model, cmd: [playSound(APP_SOUND.navBackwardMin)] };
          }
          return { model, cmd: [playSound(APP_SOUND.navForwardMin)] };
        })
      );
    }

    case "vs-user": {
      if (model.mode?.t === "vs-user") {
        const [child, eff] = VsUser.updateFromServer(
          { ctx },
          msg.c,
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
      if (model.mode?.t === "vs-bot") {
        const updated = VsBot.updateFromServer({
          msg: msg.c,
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
      if (model.mode?.t !== "puzzle") {
        return { model };
      }

      const updated = Puzzle.updateFromServer({
        ctx,
        model: model.mode.c,
        msg: msg.c,
      });

      return {
        model: { ...model, mode: { t: "puzzle", c: updated.model } },
        eff: Eff.t("puzzle", updated?.eff ?? Eff.None),
        evt: updated.evt,
        cmd: ClientCmd.tag("puzzle", updated.cmd),
      };
    }
  }
};

export const updateFromEvt: Client["updateFromEvt"] = (input) => {
  return input;
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Client["subscriptions"] = (input) => {
  return Sub.None;
};

//
//
//
// View
//
//
//

export const View: Client["View"] = ({ ctx, model, dispatch }) => {
  switch (model.mode?.t) {
    case "none": {
      return (
        <MainMenuScreen
          title="Chess"
          ctx={ctx}
          renderCoverArt={(props) => <ViewCoverArt {...props} />}
          buttons={[
            mainMenuButtons.playComputer({
              onClick: () =>
                dispatch({
                  t: "input-mode",
                  mode: "vs-bot",
                  userId: ctx.currentUserId,
                }),
            }),
            mainMenuButtons.playFriend({
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
      return (
        <VsBot.View
          ctx={ctx}
          dispatch={(c) => dispatch({ t: "vs-bot", c })}
          model={model.mode.c}
          onClose={() => {
            dispatch({
              t: "input-mode",
              mode: "none",
              userId: ctx.currentUserId,
            });
          }}
        />
      );
    }

    case "vs-user": {
      return (
        <VsUser.View
          ctx={ctx}
          model={model.mode.c}
          dispatch={(c) => dispatch({ t: "vs-user", c })}
          onQuit={() => {
            dispatch({
              t: "input-mode",
              mode: "none",
              userId: ctx.currentUserId,
            });
          }}
        />
      );
    }

    case "puzzle": {
      return (
        <Puzzle.View
          ctx={ctx}
          model={model.mode.c}
          dispatch={(c) => dispatch({ t: "puzzle", c })}
          onClose={() => {
            dispatch({
              t: "input-mode",
              mode: "none",
              userId: ctx.currentUserId,
            });
          }}
        />
      );
    }
  }
};

//
//
//
//
//
//

export const mergeWithServer: Client["mergeWithServer"] = ({
  ctx,
  client,
  server,
}) => {
  const initial = init({ ctx });
  switch (server.t) {
    case "none": {
      const model: ClientModel = {
        ...client,
        mode: { t: "none" },
      };
      return {
        ...initial,
        model,
      };
    }

    case "puzzle": {
      return {
        ...initial,
        model: {
          ...client,
          mode: {
            t: "puzzle",
            c: Puzzle.mergeWithServer({
              client: client?.mode.t === "puzzle" ? client.mode.c : undefined,
              server: server.c,
            }),
          },
        },
      };
    }

    case "vs-user": {
      return {
        ...initial,
        model: {
          ...client,
          mode: {
            t: "vs-user",
            c: VsUser.mergeWithServer({
              client: client?.mode.t === "vs-user" ? client.mode.c : undefined,
              server: server.c,
            }),
          },
        },
      };
    }

    case "vs-bot": {
      return {
        ...initial,
        model: {
          ...client,
          mode: {
            t: "vs-bot",
            c: VsBot.mergeWithServer({
              server: server.c,
              client: client?.mode.t === "vs-bot" ? client.mode.c : undefined,
            }),
          },
        },
      };
    }
  }
};
