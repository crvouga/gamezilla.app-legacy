import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import {
  Avatar,
  Button,
  IconArrowLeftOnRect,
  Tabs,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Sub } from "gamezilla/@SHARED/core";
import { ViewSpaceHostChip } from "../../../../@SHARED/game";
import { ClientModule, initClient } from "./builder.core";
import { PackListClient } from "./pack-list/pack-list";
import { PuzzleEditorClient } from "./puzzle-editor/puzzle-editor.client";
import { PuzzleListClient } from "./puzzle-list/puzzle-list.client";

const update: ClientModule["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    //
    (model) => updateLocation({ ...input, model }),
    //
    (model) => PackListClient.update({ ...input, model }),
    (model) => PuzzleEditorClient.update({ ...input, model }),
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

const View: ClientModule["View"] = (input) => {
  const { ctx, modelGame, dispatch, model } = input;

  switch (modelGame.t) {
    case "build": {
      return <PuzzleEditorClient.View {...input} />;
    }

    case "list": {
      const isSpectating = ctx.space.hostId !== ctx.currentUserId;

      if (isSpectating) {
        const host = ctx.profiles[ctx.space.hostId];
        const name = host?.username ?? "Host";
        return (
          <div className="h-ull flex w-full flex-1 flex-col items-center justify-center gap-4">
            <div className="flex w-full flex-col items-center justify-center gap-2">
              <Avatar src={host?.avatarUrl} className="h-20 w-20" />
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold">{name}</p>
                <ViewSpaceHostChip />
              </div>
            </div>
            <p className="text-lg font-bold text-secondary">
              Choosing a puzzle to build
            </p>
          </div>
        );
      }

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
  init: initClient,
  update,
  subscriptions,
  View,
  ViewFeedItem,
};
