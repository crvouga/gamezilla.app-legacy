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
import { Sub, loading } from "gamezilla/@SHARED/core";
import { sendToServer } from "gamezilla/@CHILD/app/@SHARED/client";

const update: ClientModule["update"] = (input) => {
  return GameClientModule.chainUpdates({ model: input.model }, (model) =>
    updateFromMsg({ ...input, model })
  );
};

const updateFromMsg: ClientModule["update"] = (input) => {
  const { model, msg, ctx } = input;

  if (!msg) {
    return { model };
  }

  switch (msg.t) {
    case "time-passed": {
      return { model };
    }

    case "user-observed-end-of-list": {
      return {
        model: {
          ...model,
          listed: loading,
        },
        cmd: [
          sendToServer({
            t: "list-puzzles",
            input: {
              order: {
                createdAt: "desc",
              },
              pagination: {
                limit: 10,
                offset: 0,
              },
              where: {
                createdBy: ctx.space.hostId,
              },
            },
          }),
        ],
      };
    }

    default: {
      return { model };
    }
  }
};

const subscriptions: ClientModule["subscriptions"] = (_input) => {
  return Sub.None;
};

const View: ClientModule["View"] = (input) => {
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

export const List: Omit<ClientModule, "init"> = {
  update,
  subscriptions,
  View,
  ViewFeedItem,
};
