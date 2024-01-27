import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import { sendToServer } from "gamezilla/@CHILD/app/@SHARED/client";
import {
  Avatar,
  Button,
  IconArrowLeftOnRect,
  IconPuzzlePiece,
  Spinner,
  cn,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { EmptyState } from "gamezilla/@CHILD/app/@SHARED/ui/empty-state";
import { IntersectionObserverEmitter } from "gamezilla/@CHILD/app/@SHARED/ui/intersection-observer";
import {
  Posix,
  Result,
  Sub,
  TimeSpan,
  descend,
  isPending,
  loading,
} from "gamezilla/@SHARED/core";
import { ViewSpaceHostChip } from "../../../../@SHARED/game";
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

  if (msg?.t === "user-observed-end-of-list") {
    return {
      model: { ...model, listed: loading },
      cmd: [
        sendToServer({
          t: "list-puzzles",
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

  if (fromServer?.t === "listed-puzzle") {
    const puzzles =
      fromServer.listed.t === "ok" ? fromServer.listed.value.items : [];

    const puzzlesNew = puzzles.reduce(
      (acc, puzzle) => ({ ...acc, [puzzle.id]: puzzle }),
      model.puzzles
    );

    const totalNew =
      fromServer.listed.t === "ok"
        ? fromServer.listed.value.total
        : model.total;

    return {
      model: {
        listed: Result.mapOk(fromServer.listed, () => null),
        total: totalNew,
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
  const shouldShowLoadingState = isPending(model.listed);
  const shouldShowEmptyState = !shouldShowLoadingState && puzzles.length === 0;

  return (
    <div className="flex w-full flex-1 flex-col gap-2 overflow-hidden">
      <div className="relative flex w-full flex-1 flex-col items-center overflow-y-scroll">
        <p className="w-full p-4 text-left text-3xl font-bold">Your puzzles</p>

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
                  t: "user-opened-puzzle",
                  puzzle,
                  userId: ctx.currentUserId,
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
          text="Create New"
          variant="contained"
          color="primary"
          disabled={typeof model.total !== "number"}
          onClick={() => {
            if (typeof model.total !== "number") {
              return;
            }

            dispatch({
              t: "user-created-new-puzzle",
              puzzle: FlowPuzzle.create({
                count: model.total + 1,
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
            });
          }}
        />
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

export const List: Pick<ClientModule, "update" | "subscriptions" | "View"> = {
  update,
  subscriptions,
  View,
};
