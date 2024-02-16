import {
  SpaceClientCtx,
  SpaceClientEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { SpaceClientCmd } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space-client-cmd"
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import { sendToServer, showErrSm } from "gamezilla/@CHILD/app/@SHARED/client"
import { IconPuzzlePiece, Spinner, cn } from "gamezilla/@CHILD/app/@SHARED/ui"
import { EmptyState } from "gamezilla/@CHILD/app/@SHARED/ui/empty-state"
import { IntersectionObserverEmitter } from "gamezilla/@CHILD/app/@SHARED/ui/intersection-observer"
import {
  Posix,
  Result,
  TimeSpan,
  descend,
  isErr,
  isPending,
  loading,
} from "gamezilla/@SHARED/core"
import { spaceClientCtx } from "../../../../@SHARED/testing/client"
import {
  ModelClient,
  MsgClient,
  MsgToClient,
  MsgToServer,
} from "./puzzle-list.core"
import { FlowPuzzle } from "../flow-puzzle/flow-puzzle"
import { FlowGridUI } from "../flow"

type ClientModule = AppClientModule<{
  Model: ModelClient
  Msg: MsgClient
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Ctx: SpaceClientCtx
  MsgInCmd: never
  MsgInEvent: SpaceClientEvent
  MsgOutCmd: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>
  MsgOutEvent: SpaceClientEvent
  ViewSlot: "fab"
}>

const update: ClientModule["update"] = (input) => {
  return AppClientModule.chainUpdates(
    { model: input.model },
    (model) => updatePuzzleList({ ...input, model }),
    //
  )
}

const updatePuzzleList: ClientModule["update"] = (input) => {
  const { model, msg, msgServer } = input

  switch (msg?.t) {
    case "user-observed-end-of-list": {
      return {
        model: {
          ...model,
          puzzleListRequest: loading,
        },
        msgCmd: [
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
                createdBy: spaceClientCtx.space.hostId,
              },
            },
          }),
        ],
      }
    }
  }

  switch (msgServer?.t) {
    case "listed-puzzle": {
      const puzzles =
        msgServer.listed.t === "ok" ? msgServer.listed.value.items : []

      const puzzlesNew = puzzles.reduce(
        (acc, puzzle) => ({ ...acc, [puzzle.id]: puzzle }),
        model.puzzles,
      )

      return {
        model: {
          ...model,
          puzzleListRequest: Result.mapOk(msgServer.listed, () => null),
          puzzles: puzzlesNew,
        },
        msgCmd: isErr(msgServer.listed)
          ? showErrSm(msgServer.listed.error)
          : [],
      }
    }
    default: {
      break
    }
  }

  return { model }
}

const View: ClientModule["View"] = (input) => {
  const { model, dispatch, ctx } = input

  const puzzles = Object.values(model.puzzles)
  const shouldShowLoadingState = isPending(model.puzzleListRequest)
  const shouldShowEmptyState = !shouldShowLoadingState && puzzles.length === 0

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
              onClick={() => dispatch({ t: "user-observed-end-of-list" })}
            />
          ))}

        <div
          className={cn(
            "flex h-32 w-full items-center justify-center py-6",
            !shouldShowLoadingState && "opacity-0",
          )}
        >
          <Spinner />
        </div>

        <IntersectionObserverEmitter
          id="puzzle-builder-list"
          onVisible={() => dispatch({ t: "user-observed-end-of-list" })}
        />
      </div>

      <div className="absolute bottom-5 right-5 bg-black">
        {input.slots?.fab}
      </div>
    </div>
  )
}

const FlowPuzzleListItem = ({
  now,
  puzzle,
  onClick,
}: {
  now: Posix
  puzzle: FlowPuzzle
  onClick: () => void
}) => {
  return (
    <button
      key={puzzle.id}
      className="box-border flex w-full items-center gap-4 border border-neutral-700 text-left hover:bg-black"
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
  )
}

export const PuzzleListClient = {
  update,
  View,
}
