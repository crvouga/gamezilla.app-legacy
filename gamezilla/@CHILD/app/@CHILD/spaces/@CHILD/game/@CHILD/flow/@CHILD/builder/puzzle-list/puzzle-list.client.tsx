import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import {
  sendToServer,
  showErrorToast,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  Avatar,
  IconPuzzlePiece,
  Spinner,
  cn,
} from "gamezilla/@CHILD/app/@SHARED/ui";
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
import { ViewSpaceHostChip } from "../../../../../@SHARED/game";
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
  const { model, msg, fromServer, ctx } = input;

  if (msg?.t === "list/user-observed-end-of-list") {
    return {
      model: { ...model, puzzleListRequest: loading },
      cmd: [
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

  if (fromServer?.t === "list/listed-puzzle") {
    const puzzles =
      fromServer.listed.t === "ok" ? fromServer.listed.value.items : [];

    const puzzlesNew = puzzles.reduce(
      (acc, puzzle) => ({ ...acc, [puzzle.id]: puzzle }),
      model.puzzles
    );

    return {
      model: {
        ...model,
        puzzleListRequest: Result.mapOk(fromServer.listed, () => null),
        puzzles: puzzlesNew,
      },
      cmd: isErr(fromServer.listed)
        ? showErrorToast(fromServer.listed.error)
        : [],
    };
  }

  return { model };
};

const View: ClientModule["View"] = (input) => {
  const { model, gameState, dispatch, ctx } = input;

  if (gameState.t !== "list") {
    return null;
  }

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
                dispatch({
                  t: "game-event",
                  c: {
                    t: "user-opened-puzzle",
                    puzzle,
                    userId: ctx.currentUserId,
                  },
                })
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
