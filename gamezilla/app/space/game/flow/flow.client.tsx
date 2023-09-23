import { Sub } from "gamezilla/@SHARED/core";
import { IconGamepad, IconScrewdriverWrench } from "gamezilla/app/@SHARED/ui";
import { SpaceGameClient } from "gamezilla/app/space/@SHARED";
import { MainMenuScreen } from "gamezilla/app/space/game/@SHARED";
import { ViewCoverArt } from "./@SHARED/flow-cover-art";
import { FlowViewCtx } from "./@SHARED/flow-ctx";
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
    const merged = mergeWithServer({ ...input, server: msg.result.value });
    return merged;
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
  switch (model.t) {
    case "none": {
      return { model };
    }
    case "play": {
      return Play.updateFromEvt({ ...input, model });
    }
    case "puzzle-builder": {
      return PuzzleBuilder.updateFromEvt({ ...input, model });
    }
  }
};

export const mergeWithServer: Client["mergeWithServer"] = (input) => {
  const { client: client_, server } = input;

  const client: ClientModel = client_ ?? { t: "none" };

  switch (server.t) {
    case "none": {
      return { model: server };
    }

    case "puzzle-builder": {
      return PuzzleBuilder.mergeWithServer({
        ...input,
        server,
        client: client.t === "puzzle-builder" ? client : undefined,
      });
    }

    case "play": {
      return Play.mergeWithServer({
        ...input,
        server,
        client: client.t === "play" ? client : undefined,
      });
    }
  }
};

export const subscriptions: Client["subscriptions"] = (input) => {
  const { model } = input;
  switch (model.t) {
    case "none": {
      return Sub.None;
    }

    case "play": {
      return Play.subscriptions({ ...input, model });
    }

    case "puzzle-builder": {
      return PuzzleBuilder.subscriptions({ ...input, model });
    }
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

  switch (model.t) {
    case "none": {
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
    }

    case "play": {
      return <Play.View {...input} ctx={ctx} model={model} />;
    }

    case "puzzle-builder": {
      return <PuzzleBuilder.View {...input} ctx={ctx} model={model} />;
    }
  }
};
