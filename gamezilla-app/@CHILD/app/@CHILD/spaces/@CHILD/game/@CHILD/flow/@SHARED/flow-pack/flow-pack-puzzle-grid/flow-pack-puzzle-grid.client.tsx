import {
  SpaceClientCtx,
  SpaceClientEvent,
} from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { SpaceClientCmd } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/space-client-cmd"
import { AppClientModule } from "gamezilla-app/@CHILD/app/@SHARED/architecture/app-client"
import {
  sendToServer,
  showErrSm,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import { IntersectionObserverEmitter } from "gamezilla-app/@CHILD/app/@SHARED/ui/intersection-observer"
import { RequestResponse, Result, isErr } from "gamezilla-app/@SHARED/core"
import { FlowPack } from ".."
import {
  ModelClient,
  MsgClient,
  MsgToClient,
  MsgToServer,
} from "./flow-pack-puzzle-grid.core"

type Ctx = SpaceClientCtx & {
  pack?: FlowPack | null
}

type ClientModule = AppClientModule<{
  Ctx: Ctx
  Model: ModelClient
  ModelLocation: null
  Msg: MsgClient
  MsgInCmd: null
  MsgInEvent: SpaceClientEvent
  MsgOutCmd: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>
  MsgOutEvent: null
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  ViewSlot: {
    grid: {
      request: RequestResponse<string, null>
    }
  }
}>

const ObserveGrid: Pick<ClientModule, "View" | "update"> = {
  update(input) {
    switch (input.msg?.t) {
      case "user-observed-grid": {
        if (!input.ctx.pack) {
          return { model: input.model }
        }

        const isMissingPuzzles = input.ctx.pack.puzzleIds.some(
          (puzzleId) => !input.model.puzzles[puzzleId],
        )

        if (!isMissingPuzzles) {
          return { model: input.model }
        }

        return {
          model: {
            ...input.model,
            request: RequestResponse.requesting(input.ctx.now),
          },
          msgCmd: [
            sendToServer({
              t: "list-puzzles-by-id",
              puzzleIds: input.ctx.pack.puzzleIds,
            }),
          ],
        }
      }
    }

    return { model: input.model }
  },
  View(input) {
    return (
      <IntersectionObserverEmitter
        id="flow-pack-puzzle-grid"
        onVisible={() => input.dispatch({ t: "user-observed-grid" })}
      />
    )
  },
}

const ServerListedPuzzles: Pick<ClientModule, "update"> = {
  update(input) {
    const { model, msgServer } = input
    switch (msgServer?.t) {
      case "listed-puzzles-by-id": {
        return AppClientModule.chainUpdates(
          { model },
          //
          (model) => {
            if (isErr(msgServer.listed)) {
              return {
                model,
                msgCmd: showErrSm(msgServer.listed.error),
              }
            }

            const puzzlesNew = msgServer.listed.value.items.reduce(
              (acc, puzzle) => ({ ...acc, [puzzle.id]: puzzle }),
              input.model.puzzles,
            )

            return {
              model: {
                ...input.model,
                puzzles: puzzlesNew,
              },
            }
          },
          (model) => {
            return {
              model: {
                ...model,
                request: RequestResponse.response(
                  model.request,
                  input.ctx.now,
                  Result.mapOk(msgServer.listed, () => null),
                ),
              },
            }
          },
        )
      }
    }

    return { model: input.model }
  },
}

const RequestTimeout: Pick<ClientModule, "update" | "subscriptions"> = {
  update(input) {
    const { model } = input
    return {
      model: {
        ...model,
        request: RequestResponse.elapsed(model.request, input.ctx.now),
      },
    }
  },
  subscriptions(input) {
    return RequestResponse.subscriptions(
      input.model.request,
      () => ({ t: "elapsed" }),
      //
    )
  },
}

export const FlowPackPuzzleGridClient: Pick<
  ClientModule,
  "View" | "update" | "subscriptions" | "init"
> = {
  init() {
    return {
      model: {
        puzzles: {},
        request: RequestResponse.notAsked,
      },
    }
  },
  update(input) {
    return AppClientModule.chainUpdates(
      { model: input.model },
      (model) => ObserveGrid.update({ ...input, model }),
      (model) => ServerListedPuzzles.update({ ...input, model }),
      (model) => RequestTimeout.update({ ...input, model }),
    )
  },
  View(input) {
    return (
      <>
        {input.slots?.grid({
          request: input.model.request,
        })}
        <ObserveGrid.View {...input} />
      </>
    )
  },
  subscriptions(input) {
    return RequestTimeout.subscriptions(input)
  },
}
