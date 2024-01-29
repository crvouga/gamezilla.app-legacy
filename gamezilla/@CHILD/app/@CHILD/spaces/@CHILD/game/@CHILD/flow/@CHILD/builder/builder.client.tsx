import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import {
  Button,
  IconArrowLeftOnRect,
  Tabs,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Sub, notAsked } from "gamezilla/@SHARED/core";
import { ClientModule } from "./builder.core";
import { PuzzleBuilderClient } from "./puzzle-builder/puzzle-builder.client";
import { PuzzleListClient } from "./puzzle-list/puzzle-list.client";
import { PackListClient } from "./pack-list/pack-list";

const init: ClientModule["init"] = {
  puzzleListRequest: notAsked,
  puzzleCreateRequest: notAsked,
  puzzles: {},
  editNameDraft: "",
  editNameRequest: notAsked,
  deleteForeverRequest: notAsked,
  listTab: "puzzles",
};

const update: ClientModule["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    //
    (model) => updateGameEvent({ ...input, model }),
    (model) => updateLocation({ ...input, model }),
    //
    (model) => PackListClient.update({ ...input, model }),
    (model) => PuzzleBuilderClient.update({ ...input, model }),
    (model) => PuzzleListClient.update({ ...input, model })
  );
};

const updateLocation: ClientModule["update"] = (input) => {
  const { model, msg } = input;

  switch (msg?.t) {
    case "user-selected-list-tab": {
      return { model: { ...model, listTab: msg.listTab } };
    }

    default: {
      return { model };
    }
  }
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

const View: ClientModule["View"] = (input) => {
  const { gameState, dispatch, model } = input;

  switch (gameState.t) {
    case "build": {
      return <PuzzleBuilderClient.View {...input} />;
    }

    case "list": {
      return (
        <div className="flex h-full w-full flex-1 flex-col">
          <Tabs
            tabs={["puzzles", "packs"]}
            labels={{
              packs: "Packs",
              puzzles: "Puzzles",
            }}
            onSelect={(listTab) =>
              dispatch({ t: "user-selected-list-tab", listTab })
            }
            selected={model.listTab}
          />

          {model.listTab === "puzzles" && <PuzzleListClient.View {...input} />}

          {model.listTab === "packs" && <PackListClient.View {...input} />}

          <div className="flex w-full items-center gap-4 border-t border-neutral-700 p-4">
            <Button
              onClick={input.ctx.onQuit}
              className="flex-1"
              text="Exit"
              start={<IconArrowLeftOnRect className="h-8 w-8" />}
              variant="contained"
              color="default"
            />
          </div>
        </div>
      );
    }
  }
};

const ViewFeedItem: ClientModule["ViewFeedItem"] = () => {
  return <div></div>;
};

const subscriptions: ClientModule["subscriptions"] = (_input) => {
  return Sub.None;
};

export const BuilderClient: ClientModule = {
  init,
  update,
  subscriptions,
  View,
  ViewFeedItem,
};
