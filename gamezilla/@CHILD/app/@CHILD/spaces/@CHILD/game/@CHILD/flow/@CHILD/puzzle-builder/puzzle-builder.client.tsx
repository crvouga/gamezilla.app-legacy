import { APP_SOUND, playSound } from "gamezilla/@CHILD/app/@SHARED/client";
import { Builder } from "./builder.client";
import {
  Button,
  IconArrowLeftOnRect,
  Spinner,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { ClientModule } from "./puzzle-builder.core";
import { FlowGrid } from "../../@SHARED/flow";
import { FlowPuzzle } from "../../@SHARED/flow-puzzle/flow-puzzle";
import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import { IntersectionObserverEmitter } from "gamezilla/@CHILD/app/@SHARED/ui/intersection-observer";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { notAsked } from "gamezilla/@SHARED/core";

const init: ClientModule["init"] = {
  listed: notAsked,
  puzzles: {},
};

const update: ClientModule["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromGameEvent({ ...input, model }),
    (model) => Builder.update({ ...input, model })
  );
};

const updateFromGameEvent: ClientModule["update"] = (input) => {
  const { gameEvent, model } = input;

  if (!gameEvent) {
    return { model };
  }

  switch (gameEvent.t) {
    case "grid-ui-edit":
    case "grid-ui-play":
    case "listed-puzzles":
    case "user-saved-changes":
    case "user-changed-to-play-mode":
    case "user-changed-to-edit-mode":
    case "user-exited-builder":
    case "time-passed": {
      return { model };
    }
    case "user-created-new-puzzle": {
      return { model, cmd: [playSound(APP_SOUND.navForwardMin)] };
    }
  }
};

const updateFromMsg: ClientModule["update"] = (input) => {
  const { model, msg } = input;

  if (!msg) {
    return { model };
  }

  switch (msg.t) {
    case "time-passed": {
      return { model };
    }

    case "user-observed-end-of-list": {
      return {
        model,
      };
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
  return Builder.subscriptions(input);
};

const View: ClientModule["View"] = (input) => {
  const { gameState } = input;

  switch (gameState.t) {
    case "build": {
      return <Builder.View {...input} />;
    }

    case "list": {
      return <ViewList {...input} />;
    }
  }
};

const ViewList: ClientModule["View"] = (input) => {
  const { gameState, dispatch } = input;

  if (gameState.t !== "list") {
    return null;
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-2">
      <div className="flex w-full flex-1 flex-col items-center overflow-y-scroll">
        <div className="flex w-full items-center justify-center py-6">
          <Spinner />
        </div>

        <IntersectionObserverEmitter
          id="puzzle-builder-list"
          onVisible={() => {
            dispatch({ t: "user-observed-end-of-list" });
          }}
        />
      </div>

      <div className="flex w-full items-center gap-4 border-t border-neutral-700 p-4">
        <Button
          onClick={input.ctx.onQuit}
          className="flex-1"
          text="Exit"
          start={<IconArrowLeftOnRect />}
          variant="contained"
          color="default"
        />
        <Button
          className="flex-1"
          text="Create"
          variant="contained"
          color="primary"
          onClick={() =>
            dispatch({
              t: "user-created-new-puzzle",
              puzzle: FlowPuzzle.create({
                createdAt: input.ctx.now,
                createdBy: input.ctx.currentUserId,
                puzzle: {
                  t: "grid",
                  c: FlowGrid.init({
                    width: 10,
                    height: 10,
                  }),
                },
              }),
            })
          }
        />
      </div>
    </div>
  );
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
