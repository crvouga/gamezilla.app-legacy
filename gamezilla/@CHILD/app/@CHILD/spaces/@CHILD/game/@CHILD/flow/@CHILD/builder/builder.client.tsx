import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { Sub, notAsked } from "gamezilla/@SHARED/core";
import { PuzzleBuilder } from "./puzzle-builder/puzzle-builder.client";
import { ClientModule } from "./builder.core";
import { PuzzleListClient } from "./puzzle-list/puzzle-list.client";

const init: ClientModule["init"] = {
  listRequest: notAsked,
  puzzles: {},
  total: null,
  editNameDraft: "",
  editNameRequest: notAsked,
  deleteForeverRequest: notAsked,
};

const update: ClientModule["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    (model) => updateGameEvent({ ...input, model }),
    (model) => PuzzleBuilder.update({ ...input, model }),
    (model) => PuzzleListClient.update({ ...input, model })
  );
};

const updateGameEvent: ClientModule["update"] = (input) => {
  const { model, msg } = input;
  if (msg?.t === "game-event") {
    const gameEvent = withId(msg.c);
    return {
      model,
      gameEvent: [gameEvent],
    };
  }
  return { model };
};

const subscriptions: ClientModule["subscriptions"] = (input) => {
  return Sub.batch([
    PuzzleBuilder.subscriptions(input),
    PuzzleListClient.subscriptions(input),
  ]);
};

const View: ClientModule["View"] = (input) => {
  const { gameState } = input;

  switch (gameState.t) {
    case "build": {
      return <PuzzleBuilder.View {...input} />;
    }

    case "list": {
      return <PuzzleListClient.View {...input} />;
    }
  }
};

const ViewFeedItem: ClientModule["ViewFeedItem"] = () => {
  return <div></div>;
};

export const BuilderClient: ClientModule = {
  init,
  update,
  subscriptions,
  View,
  ViewFeedItem,
};
