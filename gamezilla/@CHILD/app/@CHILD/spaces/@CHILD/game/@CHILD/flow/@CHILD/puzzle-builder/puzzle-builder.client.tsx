import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { APP_SOUND, playSound } from "gamezilla/@CHILD/app/@SHARED/client";
import { Sub, notAsked } from "gamezilla/@SHARED/core";
import { Builder } from "./builder.client";
import { List } from "./list.client";
import { ClientModule } from "./puzzle-builder.core";

const init: ClientModule["init"] = {
  listed: notAsked,
  puzzles: {},
};

const update: ClientModule["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromGameEvent({ ...input, model }),
    (model) => Builder.update({ ...input, model }),
    (model) => List.update({ ...input, model })
  );
};

const updateFromGameEvent: ClientModule["update"] = (input) => {
  const { gameEvent, model } = input;

  if (!gameEvent) {
    return { model };
  }

  switch (gameEvent.t) {
    case "user-created-new-puzzle": {
      return { model, cmd: [playSound(APP_SOUND.navForwardMin)] };
    }
    default: {
      return { model };
    }
  }
};

const updateFromMsg: ClientModule["update"] = (input) => {
  const { model, msg } = input;

  if (!msg) {
    return { model };
  }

  switch (msg.t) {
    case "time-passed":
    case "user-clicked-puzzle":
    case "user-observed-end-of-list": {
      return { model };
    }

    default: {
      return GameClientModule.chainUpdates({ model: input.model }, (model) => {
        const gameEvent = withId(msg);
        return {
          model,
          gameEvent: [gameEvent],
        };
      });
    }
  }
};

const subscriptions: ClientModule["subscriptions"] = (input) => {
  return Sub.batch([
    //
    Builder.subscriptions(input),
    List.subscriptions(input),
  ]);
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
