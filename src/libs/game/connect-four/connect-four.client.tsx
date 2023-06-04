import {
  Ctx,
  RoomCtx,
  RoomViewCtx,
  ViewCtx,
  ViewMainMenu,
  bannerArtAspectRatio,
  mainMenuButtons,
} from "@gamezilla/shared/client";
import { Cmd, Posix, Sub } from "@gamezilla/shared/core";
import * as UI from "@gamezilla/shared/ui";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
} from "./connect-four.shared";
import {
  PlayerIcon,
  ViewCoverArt,
  gameTheme,
} from "./connect-four/connect-four-ui";
import * as VsBot from "./vs-bot/vs-bot.client";
import * as VsUser from "./vs-user/vs-user.client";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init: Model = { t: "none" };

//
//
//
// Update
//
//
//

export type Msg = ClientMsg;

export const update = ({
  sendToServer,
  ctx,
  msg,
  model,
}: {
  sendToServer: (msg: ToServer) => Cmd;
  ctx: RoomCtx;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "input-mode") {
    return { model, cmd: sendToServer(msg) };
  }

  if (msg.t === "vs-user" && model.t === "vs-user") {
    const updated = VsUser.update(
      {
        sendToServer: (c) => sendToServer({ t: "vs-user", c }),
      },
      msg.c,
      model.c
    );
    return {
      model: { t: "vs-user", c: updated[0] },
      cmd: Cmd.tag_("vs-user", updated[1]),
    };
  }

  if (msg.t === "vs-bot" && model.t === "vs-bot") {
    const updated = VsBot.update(
      {
        ctx,
        sendToServer: (c) => sendToServer({ t: "vs-bot", c }),
      },
      msg.c,
      model.c
    );
    return {
      model: { t: "vs-bot", c: updated.model },
      cmd: Cmd.tag_("vs-bot", updated.cmd),
    };
  }

  return { model };
};

export const updateFromServer = ({
  ctx,
  model,
  msg,
}: {
  ctx: RoomCtx;
  msg: ToClient;
  model: Model;
}): [Model, Cmd<Msg>] => {
  switch (msg.t) {
    case "input-mode": {
      if (msg.result.t === "err") {
        return [model, Cmd.None];
      }

      const merged = syncWithServer({
        clientModel: model,
        serverModel: msg.result.value,
        ctx,
      });
      return [merged, Cmd.None];
    }

    case "vs-user": {
      if (model.t === "vs-user") {
        const [c, cmd] = VsUser.updateFromServer(msg.c, model.c);
        return [{ t: "vs-user", c }, Cmd.tag_("vs-user", cmd)];
      }
      return [model, Cmd.None];
    }

    case "vs-bot": {
      if (model.t === "vs-bot") {
        const updated = VsBot.updateFromServer({
          ctx,
          msg: msg.c,
          model: model.c,
        });
        return [
          { t: "vs-bot", c: updated.model },
          Cmd.tag_("vs-bot", updated.cmd ?? Cmd.None),
        ];
      }
      return [model, Cmd.None];
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
  model,
  $send,
  ctx,
  gameRoomCtx,
}: {
  model: Model;
  $send: (msg: Msg) => void;
  ctx: ViewCtx;
  gameRoomCtx: RoomViewCtx;
}) => {
  const goBack = () => $send({ t: "input-mode", mode: "none" });

  switch (model.t) {
    case "none": {
      return (
        <ViewMainMenu
          roomCtx={gameRoomCtx}
          title="Connect Four"
          coverArt={<ViewCoverArt />}
          buttons={[
            mainMenuButtons.playFriend({
              onClick: () => $send({ mode: "vs-user", t: "input-mode" }),
            }),
            mainMenuButtons.playComputer({
              onClick: () => $send({ mode: "vs-bot", t: "input-mode" }),
            }),
          ]}
        />
      );
    }

    case "vs-user": {
      return (
        <VsUser.View
          ctx={ctx}
          $send={(c) => $send({ t: "vs-user", c })}
          goBack={goBack}
          model={model.c}
        />
      );
    }

    case "vs-bot": {
      return (
        <VsBot.View
          ctx={ctx}
          $send={(c) => $send({ t: "vs-bot", c })}
          model={model.c}
          goBack={goBack}
        />
      );
    }
  }
};

//
//
//
// Art
//
//
//

export const BannerArt = () => {
  const iconSx: UI.Sx = { width: 120, height: 120, maxHeight: "66%" };

  return (
    <UI.AspectRatio aspectRatio={bannerArtAspectRatio}>
      <UI.List
        sx={{
          width: "100%",
          height: "100%",
          background: `linear-gradient(${gameTheme.primary.dark}, ${gameTheme.primary.darker})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}>
        <PlayerIcon playerType="PlayerOne" sx={iconSx} />
        <PlayerIcon playerType="PlayerTwo" sx={iconSx} />
      </UI.List>
      <UI.List
        sx={{
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.1)",
          position: "absolute",
          top: 0,
          left: 0,
          overflow: "hidden",
          display: "flex",
          alignItems: "flex-end",
        }}>
        <UI.Typography
          color="#fff"
          fontSize={36}
          sx={{ paddingX: 2, paddingY: 1 }}>
          Connect Four
        </UI.Typography>
      </UI.List>
    </UI.AspectRatio>
  );
};

export const syncWithServer = ({
  ctx,
  clientModel,
  serverModel,
}: {
  ctx: Ctx;
  clientModel: ClientModel;
  serverModel: ServerModel;
}): ClientModel => {
  switch (serverModel.t) {
    case "none": {
      return serverModel;
    }

    case "vs-bot": {
      if (clientModel.t === "vs-bot") {
        return {
          t: "vs-bot",
          c: VsBot.syncWithServer({
            ctx,
            clientModel: clientModel.c,
            serverModel: serverModel.c,
          }),
        };
      }

      return {
        t: "vs-bot",
        c: VsBot.syncWithServer({
          ctx,
          clientModel: VsBot.init(serverModel.c),
          serverModel: serverModel.c,
        }),
      };
    }

    case "vs-user": {
      if (clientModel.t === "vs-user") {
        return {
          t: "vs-user",
          c: VsUser.syncWithServer({
            clientModel: clientModel.c,
            serverModel: serverModel.c,
          }),
        };
      }

      return {
        t: "vs-user",
        c: VsUser.syncWithServer({
          clientModel: VsUser.init(serverModel.c),
          serverModel: serverModel.c,
        }),
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

export const subscriptions = (
  intervalId: string,
  now: Posix,
  model: Model
): Sub<Msg> => {
  switch (model.t) {
    case "none": {
      return Sub.None;
    }

    case "vs-bot": {
      return Sub.tag_("vs-bot", VsBot.subscriptions(intervalId, now, model.c));
    }

    case "vs-user": {
      return Sub.tag_("vs-user", VsUser.subscriptions(model.c));
    }
  }
};
