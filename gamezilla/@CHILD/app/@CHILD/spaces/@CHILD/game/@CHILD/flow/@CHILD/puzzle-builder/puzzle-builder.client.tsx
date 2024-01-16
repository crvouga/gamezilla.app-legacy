import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { Builder } from "./builder.client";
import {
  ClientModule
} from "./puzzle-builder.core";

const init: ClientModule["init"] = null;

const update: ClientModule["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model })
  )
};

const updateFromMsg: ClientModule["update"] = (input) => {
  const { model, msg, } = input;

  if (!msg) {
    return { model };
  }

  switch (msg.t) {
    default: {
      return GameClientModule.chainUpdates(
        { model: input.model },
        (model) => {
          const gameEvent = withId(msg);
          return {
            model,
            gameEvent: [gameEvent],
          };
        },
      );
    }
  }
};


const subscriptions: ClientModule["subscriptions"] = (input) => {
  return Builder.subscriptions(input)
};

const View: ClientModule["View"] = (input) => {
  const { gameState } = input;

  switch (gameState.t) {
    case 'build': {
      return <Builder.View {...input} />
    }
    case 'list': {
      return <div>List</div>
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
