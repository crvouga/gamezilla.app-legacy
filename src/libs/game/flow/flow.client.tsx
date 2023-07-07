import { UserId } from "@gamezilla/shared/app";
import {
  SpaceCtx,
  SpaceViewCtx,
  MainMenuScreen,
} from "@gamezilla/shared/client";
import { Cmd, Sub } from "@gamezilla/shared/core";
import { IconGamepad, IconScrewdriverWrench } from "@gamezilla/shared/ui";
import { ViewCoverArt } from "./flow-cover-art";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
} from "./flow.shared";
import { PuzzleBuilderClient } from "./puzzle-builder";
import { PlayClient } from "./play";

type Model = ClientModel;

export const init = (_args: { playerId?: UserId }): Model => {
  return {
    t: "none",
  };
};

type Msg = ClientMsg;

export const update = ({
  model,
  msg,
  sendToServer,
  ctx,
}: {
  ctx: SpaceCtx;
  msg: Msg;
  model: Model;
  sendToServer: (m: ToServer) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (model.t === "puzzle-builder" && msg.t === "puzzle-builder") {
    const updated = PuzzleBuilderClient.update({
      ctx,
      msg: msg.c,
      model: model.c,
      sendToServer: (c) => sendToServer({ t: "puzzle-builder", c }),
    });
    return {
      model: { t: "puzzle-builder", c: updated.model },
      cmd: Cmd.tag_("puzzle-builder", updated.cmd),
    };
  }

  if (model.t === "play" && msg.t === "play") {
    const updated = PlayClient.update({
      ctx,
      msg: msg.c,
      model: model.c,
      sendToServer: (c) => sendToServer({ t: "play", c }),
    });
    return {
      model: { t: "play", c: updated.model },
      cmd: Cmd.tag_("play", updated.cmd),
    };
  }

  if (msg.t === "input-mode") {
    return { model, cmd: sendToServer(msg) };
  }

  return { model };
};

export const updateFromServer = ({
  model,
  msg,
}: {
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "input-mode") {
    if (msg.result.t === "err") {
      return { model };
    }
    const merged = syncWithServer({ client: model, server: msg.result.value });
    return { model: merged };
  }

  if (msg.t === "puzzle-builder" && model.t === "puzzle-builder") {
    const updated = PuzzleBuilderClient.updateFromServer({
      model: model.c,
      msg: msg.c,
    });
    return {
      model: { t: "puzzle-builder", c: updated.model },
      cmd: Cmd.tag_("puzzle-builder", updated.cmd),
    };
  }

  if (msg.t === "play" && model.t === "play") {
    const updated = PlayClient.updateFromServer({
      model: model.c,
      msg: msg.c,
    });
    return {
      model: { t: "play", c: updated.model },
      cmd: Cmd.tag_("play", updated.cmd),
    };
  }

  return { model };
};

export const syncWithServer = ({
  client,
  server,
}: {
  client: ClientModel;
  server: ServerModel;
}): ClientModel => {
  if (server.t === "none") {
    return server;
  }

  if (server.t === "puzzle-builder") {
    const client_ = client.t === "puzzle-builder" ? client.c : undefined;
    return {
      t: "puzzle-builder",
      c: PuzzleBuilderClient.syncWithServer({
        client: client_,
        server: server.c,
      }),
    };
  }

  if (server.t === "play") {
    const client_ = client.t === "play" ? client.c : undefined;
    return {
      t: "play",
      c: PlayClient.syncWithServer({
        client: client_,
        server: server.c,
      }),
    };
  }

  return client;
};

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};

//
//
// View
//
//

export const View = ({
  ctx,
  $send,
  model,
}: {
  model: Model;
  $send: (m: Msg) => void;
  ctx: SpaceViewCtx;
}) => {
  if (model.t === "puzzle-builder") {
    return (
      <PuzzleBuilderClient.View
        $send={(c) => $send({ t: "puzzle-builder", c })}
        ctx={ctx}
        onExit={() => $send({ t: "input-mode", mode: "none" })}
        model={model.c}
      />
    );
  }

  if (model.t === "play") {
    return (
      <PlayClient.View
        $send={(c) => $send({ t: "play", c })}
        ctx={ctx}
        onExit={() => $send({ t: "input-mode", mode: "none" })}
        model={model.c}
      />
    );
  }

  return (
    <MainMenuScreen
      renderCoverArt={(props) => <ViewCoverArt {...props} />}
      ctx={ctx}
      title="Flow"
      buttons={[
        {
          renderIcon: (props) => <IconGamepad {...props} />,
          title: "Play",
          description: "Start playing puzzles",
          onClick: () => {
            $send({ t: "input-mode", mode: "play" });
          },
        },
        {
          renderIcon: (props) => <IconScrewdriverWrench {...props} />,
          title: "Puzzle builder",
          description: "Build puzzles for other players to play",
          onClick: () => {
            $send({ t: "input-mode", mode: "puzzle-builder" });
          },
        },
      ]}
    />
  );
};
