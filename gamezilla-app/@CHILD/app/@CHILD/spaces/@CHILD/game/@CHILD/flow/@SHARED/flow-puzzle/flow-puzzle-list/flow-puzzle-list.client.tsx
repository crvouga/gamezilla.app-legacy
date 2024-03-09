import { AppClientModule } from "gamezilla-app/@CHILD/app/@SHARED/architecture/app-client"
import {
  sendToServer,
  showErrSm,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import {
  IconPuzzlePiece,
  Spinner,
  cn,
} from "gamezilla-app/@CHILD/app/@SHARED/ui"
import { EmptyState } from "gamezilla-app/@CHILD/app/@SHARED/ui/empty-state"
import { IntersectionObserverEmitter } from "gamezilla-app/@CHILD/app/@SHARED/ui/intersection-observer"
import {
  Posix,
  RequestResponse,
  Result,
  TimeSpan,
  descend,
  isErr,
} from "gamezilla-app/@SHARED/core"
import { FlowVariantUI } from "../../flow"
import { FlowPuzzle } from "../flow-puzzle"
import { ClientModule } from "./flow-puzzle-list.core"

const update: ClientModule["update"] = (input) => {
  return AppClientModule.andThen(
    { model: input.model },
    //
    (model) => updatePuzzleList({ ...input, model }),
    //
  )
}

const updatePuzzleList: ClientModule["update"] = (input) => {
  const { model, msg, msgServer, ctx } = input

  switch (msg?.t) {
    case "flow-puzzle-list.user-observed-end-of-list": {
      return {
        model: {
          ...model,
          request: RequestResponse.requesting(input.ctx.now),
        },
        msgCmd: [
          sendToServer({
            t: "flow-puzzle-list.list-puzzles",
            input: {
              order: {
                lastUpdatedAt: "desc",
              },
              pagination: {
                limit: 25,
                offset: 0,
              },
              where: {
                createdBy: {
                  equals: ctx.space.hostId,
                },
              },
            },
          }),
        ],
      }
    }

    case "flow-puzzle-list.elasped": {
      const requestNew = RequestResponse.elapsed(model.request, ctx.now)
      return {
        model: {
          ...model,
          request: requestNew,
        },
      }
    }
  }

  switch (msgServer?.t) {
    case "flow-puzzle-list.listed-puzzle": {
      const puzzles =
        msgServer.listed.t === "ok" ? msgServer.listed.value.items : []

      const puzzlesNew = puzzles.reduce(
        (acc, puzzle) => ({ ...acc, [puzzle.id]: puzzle }),
        model.puzzles,
      )

      return {
        model: {
          ...model,
          request: RequestResponse.response(
            model.request,
            ctx.now,
            Result.mapOk(msgServer.listed, () => null),
          ),
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
  const shouldShowLoadingState =
    model.request.t === "not-asked" || model.request.t === "loading"
  const shouldShowEmptyState = !shouldShowLoadingState && puzzles.length === 0

  return (
    <div className="relative flex h-full w-full flex-col gap-2 overflow-hidden">
      <div className="border-1 relative flex w-full flex-1 flex-col items-center overflow-y-scroll border-t border-neutral-700">
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
              onClick={() => input.emits?.clickedPuzzleItem(puzzle)}
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
          onVisible={() =>
            dispatch({ t: "flow-puzzle-list.user-observed-end-of-list" })
          }
        />
      </div>

      <div className="absolute bottom-5 right-5 bg-black">
        {input.slots?.fab(null)}
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
      className="box-border flex w-full items-center gap-4 border-b border-b-neutral-700 text-left hover:bg-neutral-900 active:opacity-50"
      onClick={onClick}
    >
      <div className="flex aspect-square h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden border-r border-neutral-700">
        <FlowVariantUI.View disabled model={puzzle.flow} />
      </div>
      <div className="overflow-hidden">
        <p className="flex-nowrap overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold">
          {puzzle.name}
        </p>
        <p className="text-xs text-neutral-300">
          {TimeSpan.humanFriendlyString(Posix.diff(puzzle.createdAt, now))}
        </p>
      </div>
    </button>
  )
}

export const FlowPuzzleListClient = {
  update,
  View,
}
