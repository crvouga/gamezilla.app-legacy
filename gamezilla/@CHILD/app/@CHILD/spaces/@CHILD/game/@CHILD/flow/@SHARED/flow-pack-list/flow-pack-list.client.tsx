import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import { sendToServer, showErrSm } from "gamezilla/@CHILD/app/@SHARED/client"
import { IconBox, Spinner, cn } from "gamezilla/@CHILD/app/@SHARED/ui"
import { EmptyState } from "gamezilla/@CHILD/app/@SHARED/ui/empty-state"
import { IntersectionObserverEmitter } from "gamezilla/@CHILD/app/@SHARED/ui/intersection-observer"
import {
  Posix,
  RequestResponse,
  Result,
  TimeSpan,
  descend,
  isErr,
} from "gamezilla/@SHARED/core"
import { ClientModule } from "./flow-pack-list.core"
import { FlowPack } from "../flow-pack/flow-pack"

const update: ClientModule["update"] = (input) => {
  return AppClientModule.chainUpdates(
    { model: input.model },
    //
    (model) => updateList({ ...input, model }),
    //
  )
}

const updateList: ClientModule["update"] = (input) => {
  const { model, msg, msgServer, ctx } = input

  switch (msg?.t) {
    case "user-observed-end-of-list": {
      return {
        model: {
          ...model,
          request: RequestResponse.requesting(ctx.now),
        },
        msgCmd: [
          sendToServer({
            t: "list-packs",
            input: {
              order: {
                lastUpdatedAt: "desc",
              },
              pagination: {
                limit: 25,
                offset: 0,
              },
              where: {
                createdBy: ctx.currentUserId,
              },
            },
          }),
        ],
      }
    }

    case "elapsed": {
      return {
        model: {
          ...model,
          request: RequestResponse.timePassed(model.request, ctx.now),
        },
      }
    }
  }

  switch (msgServer?.t) {
    case "listed-packs": {
      const puzzles =
        msgServer.listed.t === "ok" ? msgServer.listed.value.items : []

      const packsNew = puzzles.reduce(
        (acc, puzzle) => ({ ...acc, [puzzle.id]: puzzle }),
        model.packs,
      )

      return {
        model: {
          ...model,
          request: RequestResponse.response(
            model.request,
            ctx.now,
            Result.mapOk(msgServer.listed, () => null),
          ),
          packs: packsNew,
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

  const packs = Object.values(model.packs)
  const shouldShowLoadingState = RequestResponse.isRequesting(model.request)
  const shouldShowEmptyState = !shouldShowLoadingState && packs.length === 0

  return (
    <div className="relative flex w-full flex-1 flex-col gap-2 overflow-hidden">
      <div className="relative flex max-h-full w-full flex-1 flex-col items-center overflow-hidden overflow-y-scroll border-t border-t-neutral-700">
        {shouldShowEmptyState && (
          <EmptyState
            label="No packs"
            renderIcon={(props) => <IconBox {...props} />}
          />
        )}

        {packs
          .sort(descend((pack) => Posix.toNumber(pack.lastUpdatedAt)))
          .map((pack) => (
            <FlowPackListItem
              ctx={ctx}
              key={pack.id}
              pack={pack}
              onClick={() => input.emits?.clickedPackItem(pack)}
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
          id="flow-pack-list"
          onVisible={() => dispatch({ t: "user-observed-end-of-list" })}
        />
      </div>

      <div className="absolute bottom-5 right-5 bg-black">
        {input.slots?.fab?.(null)}
      </div>
    </div>
  )
}

const FlowPackListItem = ({
  pack,
  onClick,
  ctx,
}: {
  ctx: {
    now: Posix
  }
  pack: FlowPack
  onClick: () => void
}) => {
  return (
    <button
      className="flex w-full max-w-full items-center justify-between gap-6 overflow-hidden border-b border-b-neutral-700 px-4 py-6 text-left hover:bg-neutral-900 active:opacity-50"
      onClick={onClick}
    >
      <IconBox className="h-9 w-9 shrink-0" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <p className="overflow-hidden text-ellipsis whitespace-nowrap text-lg font-bold">
          {pack.name}
        </p>
        <p className="text-sm text-secondary">
          {TimeSpan.humanFriendlyString(
            Posix.diff(pack.lastUpdatedAt, ctx.now),
          )}
        </p>
      </div>
      <p className="flex shrink-0 text-sm text-secondary">
        {plural(pack.puzzleIds, "puzzle", "puzzles")}
      </p>
    </button>
  )
}

const plural = (arr: unknown[], singular: string, plural: string) =>
  `${arr.length} ${arr.length === 1 ? singular : plural}`

const subscriptions: ClientModule["subscriptions"] = (input) => {
  return RequestResponse.subscriptions(
    input.model.request,
    () => ({ t: "elapsed" }),
    //
  )
}

export const FlowPackListClient = {
  update,
  View,
  subscriptions,
}
