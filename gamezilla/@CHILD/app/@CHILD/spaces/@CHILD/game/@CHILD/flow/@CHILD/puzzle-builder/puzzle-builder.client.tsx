import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { Sub, notAsked } from "gamezilla/@SHARED/core";
import { Builder } from "./builder.client";
import { List } from "./list.client";
import { ClientModule } from "./puzzle-builder.core";

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
    (model) => Builder.update({ ...input, model }),
    (model) => List.update({ ...input, model })
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
  return Sub.batch([Builder.subscriptions(input), List.subscriptions(input)]);
};

const View: ClientModule["View"] = (input) => {
  const { gameState } = input;

  switch (gameState.t) {
    case "build": {
      return <Builder.View {...input} />;
    }

    case "list": {
      return <List.View {...input} />;
    }
  }
};

const ViewFeedItem: ClientModule["ViewFeedItem"] = () => {
  return <div></div>;
};

export const PuzzleBuilderClient: ClientModule = {
  init,
  update,
  subscriptions,
  View,
  ViewFeedItem,
};
