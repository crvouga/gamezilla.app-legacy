import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { Builder } from "./builder.client";
import { ClientModule } from "./puzzle-builder.core";
import {
  Button,
  IconArrowLeftOnRect,
  Spinner,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { FlowPuzzle } from "../../@SHARED/flow-puzzle/flow-puzzle";
import { FlowGrid } from "../../@SHARED/flow";
import { APP_SOUND, playSound, sendToServer } from "gamezilla/@CHILD/app/@SHARED/client";

const init: ClientModule["init"] = null;

const update: ClientModule["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => listPuzzles({ ...input, model }),
    model => updateFromGameEvent({ ...input, model }),
  );
};

const updateFromGameEvent: ClientModule["update"] = (input) => {
  const { gameEvent, model } = input

  if (!gameEvent) {
    return { model };
  }

  switch (gameEvent.t) {
    case 'grid-ui-edit':
    case 'grid-ui-play':
    case 'listed-puzzles':
    case 'user-changed-to-play-mode':
    case 'user-changed-to-edit-mode':
    case 'time-passed': {
      return { model }
    }
    case 'user-created-new-puzzle': {
      return { model, cmd: [playSound(APP_SOUND.navForwardMin)] }
    }
    case 'user-exited-builder': {
      return { model, cmd: [playSound(APP_SOUND.navBackwardMin)] }
    }
  }
}

const listPuzzles: ClientModule["update"] = (input) => {
  const { model, msg, fromServer } = input;

  if (msg?.t === "time-passed") {
    return {
      model,
      cmd: [
        sendToServer({
          t: "list-puzzles",
          input: {
            pagination: {
              limit: 10,
              offset: 0,
            },
            where: {
              createdBy: input.ctx.currentUserId,
            },
            order: {
              createdAt: "desc",
            },
          },
        }),
      ],
    };
  }

  if (fromServer?.t === "listed-puzzle") {
    return { model };
  }
  return { model };
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
  const { gameState, dispatch } = input;

  switch (gameState.t) {
    case "build": {
      return <Builder.View {...input} />;
    }
    case "list": {
      return (
        <div className="flex w-full flex-1 flex-col gap-2">
          <div className="flex flex-1 items-center justify-center">
            <Spinner />
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
                        bounds: {
                          max: {
                            x: 10,
                            y: 10,
                          },
                          min: {
                            x: 0,
                            y: 0,
                          },
                        },
                      }),
                    },
                  }),
                })
              }
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

export const PuzzleBuilderClient: ClientModule = {
  init,
  update,
  subscriptions,
  View,
  ViewFeedItem,
};
