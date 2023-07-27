import { Cmd, Sub } from "@gamezilla/core";
import { GameClient, MainMenuScreen } from "@gamezilla/shared/game-space";
import { IconGamepad, IconScrewdriverWrench } from "@gamezilla/ui";
import { ViewCoverArt } from "./flow-ui/flow-cover-art";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
} from "./flow.core";
import { PlayClient } from "./play";
import { PuzzleBuilderClient } from "./puzzle-builder";

type Client = GameClient<
  ClientModel,
  ServerModel,
  ClientMsg,
  ToClient,
  ToServer
>;

export const init: Client["init"] = () => {
  return {
    model: {
      t: "none",
    },
  };
};

export const update: Client["update"] = ({ model, msg, sendToServer, ctx }) => {
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

export const updateFromServer: Client["updateFromServer"] = (input) => {
  const { model, msg } = input;
  if (msg.t === "input-mode") {
    if (msg.result.t === "err") {
      return { model };
    }
    const synced = syncWithServer({ ...input, server: msg.result.value });
    return synced;
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

export const updateFromGameSpace: Client["updateFromGameSpace"] = (input) => {
  return input;
};

export const syncWithServer: Client["syncWithServer"] = ({
  client = { t: "none" },
  server,
}) => {
  if (server.t === "none") {
    return { model: server };
  }

  if (server.t === "puzzle-builder") {
    const client_ = client.t === "puzzle-builder" ? client.c : undefined;
    return {
      model: {
        t: "puzzle-builder",
        c: PuzzleBuilderClient.syncWithServer({
          client: client_,
          server: server.c,
        }),
      },
    };
  }

  if (server.t === "play") {
    const client_ = client.t === "play" ? client.c : undefined;
    return {
      model: {
        t: "play",
        c: PlayClient.syncWithServer({
          client: client_,
          server: server.c,
        }),
      },
    };
  }

  return { model: client };
};

export const subscriptions: Client["subscriptions"] = () => {
  return Sub.None;
};

//
//
// View
//
//

export const View: Client["View"] = ({ ctx, dispatch, model }) => {
  if (model.t === "puzzle-builder") {
    return (
      <PuzzleBuilderClient.View
        dispatch={(c) => dispatch({ t: "puzzle-builder", c })}
        ctx={ctx}
        onExit={() => dispatch({ t: "input-mode", mode: "none" })}
        model={model.c}
      />
    );
  }

  if (model.t === "play") {
    return (
      <PlayClient.View
        dispatch={(c) => dispatch({ t: "play", c })}
        ctx={ctx}
        onExit={() => dispatch({ t: "input-mode", mode: "none" })}
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
            dispatch({ t: "input-mode", mode: "play" });
          },
        },
        {
          renderIcon: (props) => <IconScrewdriverWrench {...props} />,
          title: "Puzzle builder",
          description: "Build new puzzles to play",
          onClick: () => {
            dispatch({ t: "input-mode", mode: "puzzle-builder" });
          },
        },
      ]}
    />
  );
};
