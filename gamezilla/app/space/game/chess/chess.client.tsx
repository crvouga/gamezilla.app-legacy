import { Eff, Posix, RemoteResult, Sub } from "gamezilla/@SHARED/core";
import { IconPuzzlePiece } from "gamezilla/app/@SHARED/ui";
import { SpaceGameClient, SpaceViewCtx } from "gamezilla/app/space/@SHARED";
import {
  MainMenuScreen,
  mainMenuButtons,
} from "gamezilla/app/space/game/@SHARED";
import { ViewCoverArt } from "./@SHARED/chess-ui";
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
import { ClientCmd } from "gamezilla/app/@SHARED/client";

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
    case "preload-audio-done": {
      return { model };
    }

    case "input-mode": {
      return {
        model: {
          ...model,
          requests: { ...model.requests, [msg.t]: RemoteResult.Loading },
        },
        cmd: [{ t: "send-to-server", msg }],
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

      const merged = syncWithServer({
        ctx,
        client: modelNew,
        server: result.value,
      });

      return merged;
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

export const syncWithServer: Client["syncWithServer"] = ({
  client = { mode: { t: "none" }, requests: {} },
  server,
}) => {
  switch (server.t) {
    case "none": {
      return { model: { ...client, mode: { t: "none" } } };
    }

    case "puzzle": {
      if (client?.mode.t === "puzzle") {
        return {
          model: {
            ...client,
            mode: {
              t: "puzzle",
              c: Puzzle.syncWithServer({
                client: client.mode.c,
                server: server.c,
              }),
            },
          },
        };
      }

      const initial = Puzzle.init();

      return {
        model: {
          ...client,
          mode: {
            t: "puzzle",
            c: Puzzle.syncWithServer({
              client: initial.model,
              server: server.c,
            }),
          },
        },
      };
    }

    case "vs-user": {
      if (client?.mode.t === "vs-user") {
        return {
          model: {
            ...client,
            mode: {
              t: "vs-user",
              c: VsUser.syncWithServer(client.mode.c, server.c),
            },
          },
          eff: Eff.None,
        };
      }

      const [child, childEff] = VsUser.init({
        userId: "none",
      });

      return {
        model: {
          ...client,
          mode: {
            t: "vs-user",
            c: VsUser.syncWithServer(child, server.c),
          },
        },
        eff: Eff.t("vs-user", childEff),
      };
    }

    case "vs-bot": {
      return {
        model: {
          ...client,
          mode: {
            t: "vs-bot",
            c: VsBot.syncWithServer({
              server: server.c,
              client: client?.mode.t === "vs-bot" ? client.mode.c : undefined,
            }),
          },
        },
      };
    }
  }
};
