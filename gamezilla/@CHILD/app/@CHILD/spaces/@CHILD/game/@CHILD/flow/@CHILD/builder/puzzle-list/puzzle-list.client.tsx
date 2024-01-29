import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import {
  APP_SOUND,
  playSound,
  sendToServer,
  showErrorToast,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { IconPuzzlePiece, Spinner, cn } from "gamezilla/@CHILD/app/@SHARED/ui";
import { EmptyState } from "gamezilla/@CHILD/app/@SHARED/ui/empty-state";
import { IntersectionObserverEmitter } from "gamezilla/@CHILD/app/@SHARED/ui/intersection-observer";
import {
  Posix,
  Result,
  TimeSpan,
  descend,
  isErr,
  isPending,
  loading,
} from "gamezilla/@SHARED/core";
import { FlowGridUI } from "../../../@SHARED/flow";
import { FlowPuzzle } from "../../../@SHARED/flow-puzzle/flow-puzzle";
import { ClientModule } from "../builder.core";
import { PuzzleCreateClient } from "../puzzle-create/puzzle-create.client";

const update: ClientModule["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    (model) => updatePuzzleList({ ...input, model }),
    (model) => PuzzleCreateClient.update({ ...input, model })
  );
};

const updatePuzzleList: ClientModule["update"] = (input) => {
  const { model, msg, msgFromServer, ctx } = input;

  switch (msg?.t) {
    case "list/user-clicked-puzzle-list-item": {
      return {
        model,
        msgGameEvent: [
          withId({
            t: "user-opened-puzzle",
            puzzle: msg.puzzle,
            userId: ctx.currentUserId,
          }),
        ],
        msgCmd: [playSound(APP_SOUND.tap)],
      };
    }

    case "list/user-observed-end-of-list": {
      return {
        model: { ...model, puzzleListRequest: loading },
        msgCmd: [
          sendToServer({
            t: "list/list-puzzles",
            input: {
              order: {
                lastUpdatedAt: "desc",
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

    default: {
      break;
    }
  }

  switch (msgFromServer?.t) {
    case "list/listed-puzzle": {
      const puzzles =
        msgFromServer.listed.t === "ok" ? msgFromServer.listed.value.items : [];

      const puzzlesNew = puzzles.reduce(
        (acc, puzzle) => ({ ...acc, [puzzle.id]: puzzle }),
        model.puzzles
      );

      return {
        model: {
          ...model,
          puzzleListRequest: Result.mapOk(msgFromServer.listed, () => null),
          puzzles: puzzlesNew,
        },
        msgCmd: isErr(msgFromServer.listed)
          ? showErrorToast(msgFromServer.listed.error)
          : [],
      };
    }
    default: {
      break;
    }
  }

  return { model };
};

const View: ClientModule["View"] = (input) => {
  const { model, modelGameState, dispatch, ctx } = input;

  if (modelGameState.t !== "list") {
    return null;
  }

  const puzzles = Object.values(model.puzzles);
  const shouldShowLoadingState = isPending(model.puzzleListRequest);
  const shouldShowEmptyState = !shouldShowLoadingState && puzzles.length === 0;

  return (
    <div className="relative flex w-full flex-1 flex-col gap-2 overflow-hidden">
      <div className="relative flex w-full flex-1 flex-col items-center overflow-y-scroll">
        {shouldShowEmptyState && (
          <EmptyState
            label="No puzzles"
            renderIcon={(props) => <IconPuzzlePiece {...props} />}
          />
        )}

        {puzzles
          .sort(descend((puzzle) => Posix.toNumber(puzzle.lastUpdatedAt)))
          .map((puzzle) => (
            <FlowPuzzleListItem
              now={ctx.now}
              key={puzzle.id}
              puzzle={puzzle}
              onClick={() =>
                dispatch({ t: "list/user-clicked-puzzle-list-item", puzzle })
              }
            />
          ))}

        <div
          className={cn(
            "flex h-32 w-full items-center justify-center py-6",
            !shouldShowLoadingState && "opacity-0"
          )}
        >
          <Spinner />
        </div>

        <IntersectionObserverEmitter
          id="puzzle-builder-list"
          onVisible={() => dispatch({ t: "list/user-observed-end-of-list" })}
        />
      </div>

      <div className="absolute bottom-5 right-5 bg-black">
        <PuzzleCreateClient.ViewCreateButton {...input} />
      </div>
    </div>
  );
};

const FlowPuzzleListItem = ({
  now,
  puzzle,
  onClick,
}: {
  now: Posix;
  puzzle: FlowPuzzle;
  onClick: () => void;
}) => {
  return (
    <button
      key={puzzle.id}
      className="box-border flex w-full items-center gap-4 border border-neutral-700 text-left hover:bg-neutral-900"
      onClick={onClick}
    >
      <div className="aspect-square h-24 w-24 flex-shrink-0 overflow-hidden border-r border-neutral-700">
        <FlowGridUI.View disabled model={puzzle.puzzle.c} />
      </div>
      <div className="overflow-hidden">
        <p className="flex-nowrap overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold">
          {puzzle.name}
        </p>
        <p className="text-xs text-secondary">
          {TimeSpan.humanFriendlyString(Posix.diff(puzzle.createdAt, now))}
        </p>
      </div>
    </button>
  );
};

export const PuzzleListClient = {
  update,
  View,
};
