import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import { sendToServer } from "gamezilla/@CHILD/app/@SHARED/client";
import {
  Button,
  IconArrowLeftOnRect,
  Spinner,
  cn,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { IntersectionObserverEmitter } from "gamezilla/@CHILD/app/@SHARED/ui/intersection-observer";
import { Posix, Result, Sub, descend, loading } from "gamezilla/@SHARED/core";
import { FlowGrid, FlowGridUI } from "../../@SHARED/flow";
import { FlowPuzzle } from "../../@SHARED/flow-puzzle/flow-puzzle";
import { ClientModule } from "./puzzle-builder.core";

const update: ClientModule["update"] = (input) => {
  return GameClientModule.chainUpdates({ model: input.model }, (model) =>
    updatePuzzleList({ ...input, model })
  );
};

const updatePuzzleList: ClientModule["update"] = (input) => {
  const { model, msg, fromServer, ctx } = input;

  if (msg?.t === "user-clicked-puzzle") {
    return {
      model,
    };
  }

  if (msg?.t === "user-observed-end-of-list") {
    return {
      model: { ...model, listed: loading },
      cmd: [
        sendToServer({
          t: "list-puzzles",
          input: {
            order: {
              createdAt: "desc",
            },
            pagination: {
              limit: 25,
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

  if (fromServer?.t === "listed-puzzle") {
    const puzzles =
      fromServer.listed.t === "ok" ? fromServer.listed.value.items : [];

    const puzzlesNew = puzzles.reduce(
      (acc, puzzle) => ({ ...acc, [puzzle.id]: puzzle }),
      model.puzzles
    );

    return {
      model: {
        ...model,
        listed: Result.mapOk(fromServer.listed, () => null),
        puzzles: puzzlesNew,
      },
    };
  }

  return { model };
};

const subscriptions: ClientModule["subscriptions"] = (_input) => {
  return Sub.None;
};

const View: ClientModule["View"] = (input) => {
  const { model, gameState, dispatch } = input;

  if (gameState.t !== "list") {
    return null;
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-2 overflow-hidden">
      <div className="flex w-full flex-1 flex-col items-center overflow-y-scroll">
        {Object.values(model.puzzles)
          .sort(descend((puzzle) => Posix.toNumber(puzzle.createdAt)))
          .map((puzzle) => (
            <FlowPuzzleListItem
              key={puzzle.id}
              puzzle={puzzle}
              onClick={() => dispatch({ t: "user-clicked-puzzle" })}
            />
          ))}

        <div
          className={cn(
            "flex h-32 w-full items-center justify-center py-6",
            model.listed.t !== "loading" && "opacity-0"
          )}
        >
          <Spinner />
        </div>

        <IntersectionObserverEmitter
          id="puzzle-builder-list"
          onVisible={() => dispatch({ t: "user-observed-end-of-list" })}
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

const FlowPuzzleListItem = ({
  puzzle,
  onClick,
}: {
  puzzle: FlowPuzzle;
  onClick: () => void;
}) => {
  return (
    <button
      key={puzzle.id}
      className="flex w-full items-center gap-4 border-b border-neutral-700"
      onClick={onClick}
    >
      <div className="aspect-square h-24 w-24 overflow-hidden border-r border-neutral-700">
        <FlowGridUI.View model={puzzle.puzzle.c} />
      </div>
      <div>{puzzle.id}</div>
    </button>
  );
};

export const List: Pick<ClientModule, "update" | "subscriptions" | "View"> = {
  update,
  subscriptions,
  View,
};
