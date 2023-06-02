import {
  AppMsg,
  RoomCtx,
  RoomViewCtx,
  ViewMainMenu,
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
import {
  IconComputerDesktop,
  IconPuzzlePiece,
  IconUsers,
} from "@gamezilla/shared/ui";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
} from "./chess.shared";
import { viewCoverArt } from "./chess/chess";
import Sounds from "./chess/chess-sounds";
import * as Puzzle from "./puzzle/puzzle.client";
import * as VsBot from "./vs-bot/vs-bot.server";
import * as VsUser from "./vs-user/vs-user.client";

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
  ctx: RoomCtx;
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
        const [child, cmd] = VsBot.update(
          { sendToServer: (c) => sendToServer({ t: "vs-bot", c }) },
          msg.c,
          model.mode.c
        );

        return [
          { ...model, mode: { t: "vs-bot", c: child } },
          Cmd.tag_("vs-bot", cmd),
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
  ctx: RoomCtx;
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: AppMsg[];
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
        const [child, cmd] = VsBot.updateFromServer(msg.c, model.mode.c);

        return {
          model: { ...model, mode: { t: "vs-bot", c: child } },
          cmd: Cmd.tag_("vs-bot", cmd),
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
  $send,
  gameRoomCtx,
}: {
  ctx: RoomViewCtx;
  model: Model;
  $send: (msg: Msg) => void;
  gameRoomCtx: RoomViewCtx;
}) => {
  switch (model.mode.t) {
    case "none": {
      return (
        <ViewMainMenu
          title="Chess"
          roomCtx={gameRoomCtx}
          coverArt={viewCoverArt()}
          buttons={[
            {
              label: "Play Computer",
              icon: <IconComputerDesktop />,
              onClick: () =>
                $send({
                  t: "input-mode",
                  mode: "vs-bot",
                  userId: ctx.currentUserId,
                }),
            },
            {
              label: "Play Friend",
              icon: <IconUsers />,
              onClick: () =>
                $send({
                  t: "input-mode",
                  mode: "vs-user",
                  userId: ctx.currentUserId,
                }),
            },
            {
              label: "Puzzles",
              icon: <IconPuzzlePiece />,
              onClick: () =>
                $send({
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
          $send={(c) => $send({ t: "vs-bot", c })}
          model={model.mode.c}
          onClose={() => {
            $send({ t: "input-mode", mode: "none", userId: ctx.currentUserId });
          }}
        />
      );
    }

    case "vs-user": {
      return (
        <VsUser.View
          ctx={ctx}
          model={model.mode.c}
          $send={(c) => $send({ t: "vs-user", c })}
          onClose={() => {
            $send({ t: "input-mode", mode: "none", userId: ctx.currentUserId });
          }}
        />
      );
    }

    case "puzzle": {
      return (
        <Puzzle.View
          ctx={ctx}
          model={model.mode.c}
          $send={(c) => $send({ t: "puzzle", c })}
          onClose={() => {
            $send({ t: "input-mode", mode: "none", userId: ctx.currentUserId });
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
      if (clientModel.mode.t === "vs-bot") {
        return {
          model: {
            ...clientModel,
            mode: {
              t: "vs-bot",
              c: VsBot.syncWithServer(clientModel.mode.c, serverModel.c),
            },
          },
        };
      }

      const [child, childCmd] = VsBot.init();

      return {
        model: {
          ...clientModel,
          mode: {
            t: "vs-bot",
            c: VsBot.syncWithServer(child, serverModel.c),
          },
        },
        cmd: Cmd.tag_("vs-bot", childCmd),
      };
    }
  }
};
