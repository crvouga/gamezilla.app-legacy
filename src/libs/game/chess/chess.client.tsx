import {
  ClientAppMsg,
  SpaceCtx,
  SpaceViewCtx,
  MainMenuScreen,
  mainMenuButtons,
} from "@gamezilla/shared/client";
import {
  Audio,
  Cmd,
  Posix,
  RemoteResult,
  Sub,
  Unit,
  p,
} from "@gamezilla/shared/core";
import { IconPuzzlePiece } from "@gamezilla/shared/ui";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
} from "./chess.shared";

import Sounds from "./chess/chess-sounds";
import * as Puzzle from "./puzzle/puzzle.client";
import { ChessVsBotClient } from "./chess-vs-bot";
import * as VsUser from "./vs-user/vs-user.client";
import { ViewCoverArt } from "./chess-ui";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init = (): { model: ClientModel; cmd?: Cmd<Msg> } => {
  return {
    model: {
      mode: { t: "none" },
      requests: {},
    },
    cmd: Audio.preload(
      Array.from(Object.values(Sounds)),
      (): Msg => ({ t: "preload-audio-done" })
    ),
  };
};

//
//
//
// Update
//
//
//

export type Msg = ClientMsg;

export const update = ({
  msg,
  model,
  sendToServer,
  ctx,
}: {
  ctx: SpaceCtx;
  sendToServer: (msg: ToServer) => Cmd;
  msg: Msg;
  model: Model;
}): [Model, Cmd<Msg>] => {
  switch (msg.t) {
    case "preload-audio-done": {
      return [model, Cmd.None];
    }

    case "input-mode": {
      return [
        {
          ...model,
          requests: { ...model.requests, [msg.t]: RemoteResult.Loading },
        },
        sendToServer(msg),
      ];
    }

    case "vs-user": {
      if (model.mode.t === "vs-user") {
        const [child, cmd] = VsUser.update(
          { sendToServer: (c) => sendToServer({ t: "vs-user", c }) },
          msg.c,
          model.mode.c
        );

        return [
          { ...model, mode: { t: "vs-user", c: child } },
          Cmd.tag_("vs-user", cmd),
        ];
      }

      return [model, Cmd.None];
    }

    case "vs-bot": {
      if (model.mode.t === "vs-bot") {
        const updated = ChessVsBotClient.update({
          sendToServer: (c) => sendToServer({ t: "vs-bot", c }),
          msg: msg.c,
          model: model.mode.c,
          ctx,
        });

        return [
          { ...model, mode: { t: "vs-bot", c: updated.model } },
          Cmd.tag_("vs-bot", updated.cmd),
        ];
      }

      return [model, Cmd.None];
    }

    case "puzzle": {
      if (model.mode.t !== "puzzle") {
        return [model, Cmd.None];
      }

      const updated = Puzzle.update({
        ctx,
        sendToServer: (c) => sendToServer({ t: "puzzle", c }),
        model: model.mode.c,
        msg: msg.c,
      });

      return [
        {
          ...model,
          mode: { t: "puzzle", c: updated.model },
        },
        Cmd.tag_("puzzle", updated?.cmd ?? Cmd.None),
      ];
    }
  }
};

export const updateFromServer = ({
  ctx,
  msg,
  model,
  sendToServer,
}: {
  sendToServer: (msg: ToServer) => Cmd;
  ctx: SpaceCtx;
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: ClientAppMsg[];
} => {
  switch (msg.t) {
    case "input-mode": {
      const { result } = msg;

      const modelNew: Model = {
        ...model,
        requests: {
          ...model.requests,
          [msg.t]: p(
            result,
            RemoteResult.map(() => Unit)
          ),
        },
      };

      if (result.t === "err") {
        return { model: modelNew };
      }

      const merged = syncWithServer({
        clientModel: modelNew,
        serverModel: result.value,
        sendToServer,
      });

      return merged;
    }

    case "vs-user": {
      if (model.mode.t === "vs-user") {
        const [child, cmd] = VsUser.updateFromServer(
          { ctx },
          msg.c,
          model.mode.c
        );

        return {
          model: { ...model, mode: { t: "vs-user", c: child } },
          cmd: Cmd.tag_("vs-user", cmd),
        };
      }

      return { model };
    }

    case "vs-bot": {
      if (model.mode.t === "vs-bot") {
        const updated = ChessVsBotClient.updateFromServer({
          msg: msg.c,
          model: model.mode.c,
        });

        return {
          model: { ...model, mode: { t: "vs-bot", c: updated.model } },
          cmd: Cmd.tag_("vs-bot", updated.cmd),
        };
      }

      return { model };
    }

    case "puzzle": {
      if (model.mode.t !== "puzzle") {
        return { model };
      }

      const updated = Puzzle.updateFromServer({
        ctx,
        model: model.mode.c,
        msg: msg.c,
      });

      return {
        model: { ...model, mode: { t: "puzzle", c: updated.model } },
        cmd: Cmd.tag_("puzzle", updated?.cmd ?? Cmd.None),
        msgs: updated.msgs,
      };
    }
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = ({
  // intervalId,
  // now,
  model,
}: {
  intervalId: string;
  now: Posix;
  model: Model;
}): Sub<Msg> => {
  switch (model.mode.t) {
    case "vs-user": {
      return Sub.None;
    }
    case "none": {
      return Sub.None;
    }
    case "vs-bot": {
      return Sub.None;
    }
    case "puzzle": {
      return Sub.None;
    }
  }
};

//
//
//
// View
//
//
//

export const View = ({
  ctx,
  model,
  dispatch,
  gameSpaceCtx,
}: {
  ctx: SpaceViewCtx;
  model: Model;
  dispatch: (msg: Msg) => void;
  gameSpaceCtx: SpaceViewCtx;
}) => {
  switch (model.mode.t) {
    case "none": {
      return (
        <MainMenuScreen
          title="Chess"
          ctx={gameSpaceCtx}
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
        <ChessVsBotClient.View
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

export const syncWithServer = ({
  clientModel,
  serverModel,
  sendToServer,
}: {
  sendToServer: (msg: ToServer) => Cmd;
  clientModel: ClientModel;
  serverModel: ServerModel;
}): {
  model: ClientModel;
  cmd?: Cmd<Msg>;
} => {
  switch (serverModel.t) {
    case "none": {
      return { model: { ...clientModel, mode: { t: "none" } } };
    }

    case "puzzle": {
      if (clientModel.mode.t === "puzzle") {
        return {
          model: {
            ...clientModel,
            mode: {
              t: "puzzle",
              c: Puzzle.syncWithServer({
                client: clientModel.mode.c,
                server: serverModel.c,
              }),
            },
          },
        };
      }

      const initial = Puzzle.init({
        sendToServer: (c) => sendToServer({ t: "puzzle", c }),
      });

      return {
        model: {
          ...clientModel,
          mode: {
            t: "puzzle",
            c: Puzzle.syncWithServer({
              client: initial.model,
              server: serverModel.c,
            }),
          },
        },
        cmd: Cmd.tag_("puzzle", initial.cmd),
      };
    }

    case "vs-user": {
      if (clientModel.mode.t === "vs-user") {
        return {
          model: {
            ...clientModel,
            mode: {
              t: "vs-user",
              c: VsUser.syncWithServer(clientModel.mode.c, serverModel.c),
            },
          },
          cmd: Cmd.None,
        };
      }

      const [child, childCmd] = VsUser.init({
        userId: "none",
        sendToServer: (c) => sendToServer({ t: "vs-user", c }),
      });

      return {
        model: {
          ...clientModel,
          mode: {
            t: "vs-user",
            c: VsUser.syncWithServer(child, serverModel.c),
          },
        },
        cmd: Cmd.tag_("vs-user", childCmd),
      };
    }

    case "vs-bot": {
      return {
        model: {
          ...clientModel,
          mode: {
            t: "vs-bot",
            c: ChessVsBotClient.syncWithServer({
              serverModel: serverModel.c,
              clientModel:
                clientModel.mode.t === "vs-bot"
                  ? clientModel.mode.c
                  : undefined,
            }),
          },
        },
      };
    }
  }
};
