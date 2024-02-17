import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import { sendToServer, showErrSm } from "gamezilla/@CHILD/app/@SHARED/client"
import { IconPuzzlePiece, Spinner, cn } from "gamezilla/@CHILD/app/@SHARED/ui"
import { EmptyState } from "gamezilla/@CHILD/app/@SHARED/ui/empty-state"
import { IntersectionObserverEmitter } from "gamezilla/@CHILD/app/@SHARED/ui/intersection-observer"
import {
  Posix,
  RequestResponse,
  Result,
  descend,
  isErr,
} from "gamezilla/@SHARED/core"
import { spaceClientCtx } from "../../../../@SHARED/testing/client"
import { ClientModule, ModelClient } from "./flow-pack-list.core"

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
                createdBy: spaceClientCtx.space.hostId,
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
  const { model, dispatch } = input

  const packs = Object.values(model.packs)
  const shouldShowLoadingState = RequestResponse.isRequesting(model.request)
  const shouldShowEmptyState = !shouldShowLoadingState && packs.length === 0

  return (
    <div className="relative flex w-full flex-1 flex-col gap-2 overflow-hidden">
      <div className="relative flex w-full flex-1 flex-col items-center overflow-y-scroll">
        {shouldShowEmptyState && (
          <EmptyState
            label="No puzzles"
            renderIcon={(props) => <IconPuzzlePiece {...props} />}
          />
        )}

        {packs
          .sort(descend((pack) => Posix.toNumber(pack.lastUpdatedAt)))
          .map((pack) => (
            <>{pack.name}</>
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

const subscriptions: ClientModule["subscriptions"] = (input) => {
  return RequestResponse.subscriptions(
    input.model.request,
    () => ({ t: "elapsed" }),
    //
  )
}

const listPacks = (model: ModelClient) => {
  return Object.values(model.packs)
}

export const FlowPackListClient = {
  listPacks,
  update,
  View,
  subscriptions,
}
