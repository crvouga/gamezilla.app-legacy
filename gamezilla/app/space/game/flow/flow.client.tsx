import { Sub } from "gamezilla/@SHARED/core";
import { IconGamepad, IconScrewdriverWrench } from "gamezilla/app/@SHARED/ui";
import { SpaceGameClient } from "gamezilla/app/space/@SHARED";
import { MainMenuScreen } from "gamezilla/app/space/game/@SHARED";
import { FlowViewCtx } from "./flow-shared";
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

type Client = SpaceGameClient<
  ClientModel,
  ServerModel,
  ClientMsg,
  ToClient,
  ToServer
>;

const PuzzleBuilder = SpaceGameClient.tag(
  "puzzle-builder",
  PuzzleBuilderClient
);

const Play = SpaceGameClient.tag("play", PlayClient);

export const init: Client["init"] = () => {
  return {
    model: {
      t: "none",
    },
  };
};

export const update: Client["update"] = (input) => {
  const { model, msg } = input;

  if (msg.t === "input-mode") {
    return {
      model,
      cmd: [{ t: "send-to-server", msg }],
    };
  }

  if (model.t === "puzzle-builder" && msg.t === "puzzle-builder") {
    return PuzzleBuilder.update({ ...input, msg, model });
  }

  if (model.t === "play" && msg.t === "play") {
    return Play.update({ ...input, msg, model });
  }

  return { model };
};

export const updateFromServer: Client["updateFromServer"] = (input) => {
  const { model, msg } = input;
  if (msg.t === "input-mode") {
    if (msg.result.t === "err") {
      return { model };
    }
    const synced = mergeWithServer({ ...input, server: msg.result.value });
    return synced;
  }

  if (msg.t === "puzzle-builder" && model.t === "puzzle-builder") {
    return PuzzleBuilder.updateFromServer({ ...input, msg, model });
  }

  if (msg.t === "play" && model.t === "play") {
    return Play.updateFromServer({ ...input, msg, model });
  }

  return { model };
};

export const updateFromEvt: Client["updateFromEvt"] = (input) => {
  const { model } = input;
  if (model.t === "puzzle-builder") {
    return PuzzleBuilder.updateFromEvt({ ...input, model });
  }
  if (model.t === "play") {
    return Play.updateFromEvt({ ...input, model });
  }
  return input;
};

export const mergeWithServer: Client["mergeWithServer"] = (input) => {
  const { client: client_, server } = input;

  const client: ClientModel = client_ ?? { t: "none" };

  if (server.t === "none") {
    return { model: server };
  }

  if (server.t === "puzzle-builder") {
    return PuzzleBuilder.mergeWithServer({
      ...input,
      server,
      client: client.t === "puzzle-builder" ? client : undefined,
    });
  }

  if (server.t === "play") {
    return Play.mergeWithServer({
      ...input,
      server,
      client: client.t === "play" ? client : undefined,
    });
  }

  return { model: client };
};

export const subscriptions: Client["subscriptions"] = (input) => {
  const { model } = input;
  switch (model.t) {
    case "none":
      return Sub.None;

    case "play":
      return Play.subscriptions({ ...input, model });

    case "puzzle-builder":
      return PuzzleBuilder.subscriptions({ ...input, model });
  }
};

//
//
// View
//
//

export const View: Client["View"] = (input) => {
  const { dispatch, model } = input;
  const ctx: FlowViewCtx = {
    ...input.ctx,
    onExit: () => dispatch({ t: "input-mode", mode: "none" }),
  };

  if (model.t === "puzzle-builder") {
    return <PuzzleBuilder.View {...input} ctx={ctx} model={model} />;
  }

  if (model.t === "play") {
    return <Play.View {...input} ctx={ctx} model={model} />;
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
