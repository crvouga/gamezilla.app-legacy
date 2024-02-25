import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import {
  APP_SOUND,
  playSound,
  sendToServer,
  showErrSm,
  showToast,
} from "gamezilla/@CHILD/app/@SHARED/client"
import {
  Button,
  IconArrowLeftOnRect,
  IconChevronLeft,
  IconChevronRight,
} from "gamezilla/@CHILD/app/@SHARED/ui"
import { Sub, Time, TimeSpan } from "gamezilla/@SHARED/core"
import {
  ViewBottomButtonBar,
  ViewBottomButtonBarAction,
} from "../../../../../../@SHARED/game"
import { FlowGridUIPlay } from "../../../../@SHARED/flow"
import { FlowPackPuzzleGridUI } from "../../../../@SHARED/flow-pack-puzzle-grid"
import { FlowPack } from "../../../../@SHARED/flow-pack/flow-pack"
import { FlowPuzzleListClient } from "../../../../@SHARED/flow-puzzle-list"
import { ClientModule } from "../../build.core"

//
//
//
//
//
//

const ButtonExitBuilder: Pick<ClientModule, "update" | "View"> = {
  update(input) {
    const { model, msg, msgSync } = input

    switch (msg?.t) {
      case "pack-builder.user-clicked-exit-button": {
        return { model, msgSync: [withId(msg)] }
      }
    }

    switch (msgSync?.t) {
      case "pack-builder.user-clicked-exit-button": {
        return {
          model,
          msgCmd: [playSound(APP_SOUND.navBackwardMin)],
        }
      }
    }

    return { model }
  },

  View(input) {
    return (
      <Button
        start={<IconArrowLeftOnRect className="h-6 w-6" />}
        className="w-full"
        text="Exit"
        onClick={() =>
          input.dispatch({
            t: "pack-builder.user-clicked-exit-button",
            userId: input.ctx.currentUserId,
          })
        }
      />
    )
  },
}

//
//
//
//
//
//
//
//

const ButtonAddPuzzle: Pick<ClientModule, "update" | "View"> = {
  update(input) {
    const { model, msg } = input

    switch (msg?.t) {
      case "pack-builder.user-clicked-open-add-puzzle-button": {
        return {
          model,
          msgSync: [withId(msg)],
          msgCmd: [playSound(APP_SOUND.tap)],
        }
      }
    }
    return { model }
  },

  View(input) {
    return (
      <FlowPackPuzzleGridUI.ViewAddCell
        onClick={() =>
          input.dispatch({
            t: "pack-builder.user-clicked-open-add-puzzle-button",
            userId: input.ctx.currentUserId,
          })
        }
      />
    )
  },
}

//
//
//
//
//
//

const ScreenAddPuzzle: Pick<ClientModule, "update" | "View"> = {
  update(input) {
    const { model, msg } = input

    switch (msg?.t) {
      case "pack-builder.user-clicked-add-puzzle-item": {
        return {
          model,
          msgSync: [withId(msg)],
          msgCmd: [playSound(APP_SOUND.refreshFeed), showToast("Puzzle added")],
        }
      }

      case "pack-builder.user-closed-add-puzzle": {
        return {
          model,
          msgSync: [withId(msg)],
          msgCmd: [playSound(APP_SOUND.tap)],
        }
      }
    }

    return { model }
  },

  View(input) {
    return (
      <div className="flex h-full max-h-full w-full flex-col overflow-hidden">
        <div className="flex w-full shrink-0 items-center border-b border-neutral-700 p-4 text-3xl font-bold">
          <p className="flex-1">Add puzzle</p>
        </div>
        <div className="h-full max-h-full w-full max-w-full flex-1 overflow-hidden overflow-y-scroll">
          <FlowPuzzleListClient.View
            ctx={input.ctx}
            dispatch={(c) => input.dispatch({ t: "flow-puzzle-list", c })}
            model={input.model.flowPuzzleList}
            emits={{
              clickedPuzzleItem: (puzzle) =>
                input.dispatch({
                  t: "pack-builder.user-clicked-add-puzzle-item",
                  puzzle,
                  userId: input.ctx.currentUserId,
                }),
            }}
          />
        </div>
        <div className="flex w-full shrink-0 items-center justify-center border-t border-neutral-700 p-4">
          <Button
            text="Close"
            className="w-full"
            onClick={() =>
              input.dispatch({ t: "pack-builder.user-closed-add-puzzle" })
            }
          />
        </div>
      </div>
    )
  },
}

//
//
//
//
//
//

const ScreenPuzzleGrid: Pick<ClientModule, "update" | "View"> = {
  update(input) {
    const { model, msg } = input

    switch (msg?.t) {
      case "pack-builder.user-clicked-pack-item": {
        return {
          model,
          msgSync: [withId(msg)],
          msgCmd: [playSound(APP_SOUND.navForwardMin)],
        }
      }
    }

    return { model }
  },
  View(input) {
    const { modelSync, model } = input

    const packBuilder = modelSync.packBuilder

    if (!packBuilder) {
      return null
    }
    return (
      <div className="flex w-full flex-1 flex-col items-center justify-center">
        <div className="flex w-full flex-1 flex-col">
          <p className="w-full p-3 text-3xl font-bold">
            {packBuilder.pack.name}
          </p>
          <div className="flex w-full flex-1 flex-col items-center justify-center">
            <FlowPackPuzzleGridUI.ViewPackPuzzleGrid
              renderCell={(position) => {
                const index = FlowPackPuzzleGridUI.toIndex(position)

                const puzzleId = packBuilder.pack.puzzleIds[index]

                if (puzzleId) {
                  const puzzle = puzzleId ? model.puzzles[puzzleId] : null

                  if (!puzzle) {
                    return <FlowPackPuzzleGridUI.ViewLoadingCell />
                  }

                  return (
                    <FlowPackPuzzleGridUI.ViewPuzzleCell
                      onClick={() =>
                        input.dispatch({
                          t: "pack-builder.user-clicked-pack-item",
                          puzzle,
                          index,
                        })
                      }
                      index={index}
                    />
                  )
                }

                if (index === packBuilder.pack.puzzleIds.length) {
                  return <ButtonAddPuzzle.View {...input} />
                }

                return <FlowPackPuzzleGridUI.ViewEmptyCell />
              }}
            />
          </div>
        </div>

        <div className="w-full border-t border-neutral-700 p-4">
          <ButtonExitBuilder.View {...input} />
        </div>
      </div>
    )
  },
}

//
//
//
//
//
//
//

export const ScreenPuzzle: Pick<ClientModule, "update" | "View"> = {
  update(input) {
    const { model, msg } = input

    switch (msg?.t) {
      case "pack-builder.user-clicked-exit-puzzle-button": {
        return {
          model,
          msgSync: [withId(msg)],
          msgCmd: [playSound(APP_SOUND.navBackwardMin)],
        }
      }

      case "pack-builder.flow-play-grid-ui": {
        return {
          model,
          msgSync: [withId(msg)],
        }
      }

      case "pack-builder.user-clicked-previous-puzzle-button": {
        return {
          model,
          msgSync: [withId(msg)],
          msgCmd: [playSound(APP_SOUND.tap)],
        }
      }

      case "pack-builder.user-clicked-next-puzzle-button": {
        return {
          model,
          msgSync: [withId(msg)],
          msgCmd: [playSound(APP_SOUND.tap)],
        }
      }
    }

    return { model }
  },

  View(input) {
    if (!input.modelSync.packBuilder) {
      return null
    }

    if (input.modelSync.packBuilder.screen.t !== "screen-puzzle") {
      return null
    }

    const pack = input.modelSync.packBuilder.pack
    const puzzleIndex = input.modelSync.packBuilder.screen.puzzleIndex
    const { flowGridUIPlay, flowGrid } =
      input.modelSync.packBuilder.screen.puzzle

    return (
      <div className="flex h-full w-full flex-col ">
        <div className="flex w-full flex-1 items-center justify-center">
          <FlowGridUIPlay.View
            dispatch={(c) =>
              input.dispatch({ t: "pack-builder.flow-play-grid-ui", c })
            }
            grid={flowGrid}
            model={flowGridUIPlay}
          />
        </div>
        <ViewBottomButtonBar>
          <ViewBottomButtonBarAction
            icon={(props) => <IconArrowLeftOnRect {...props} />}
            label="Exit"
            onClick={() =>
              input.dispatch({
                t: "pack-builder.user-clicked-exit-puzzle-button",
                userId: input.ctx.currentUserId,
              })
            }
          />
          <ViewBottomButtonBarAction
            icon={(props) => <IconChevronLeft {...props} />}
            label="Previous"
            disabled={!FlowPack.canGoPrevious(pack, puzzleIndex)}
            onClick={() =>
              input.dispatch({
                t: "pack-builder.user-clicked-previous-puzzle-button",
                userId: input.ctx.currentUserId,
              })
            }
          />
          <ViewBottomButtonBarAction
            icon={(props) => <IconChevronRight {...props} />}
            label="Next"
            disabled={FlowPack.canGoNext(pack, puzzleIndex)}
            onClick={() =>
              input.dispatch({
                t: "pack-builder.user-clicked-next-puzzle-button",
                userId: input.ctx.currentUserId,
              })
            }
          />
        </ViewBottomButtonBar>
      </div>
    )
  },
}

//
//
//
//
//
//

const updateServerListedPuzzles: ClientModule["update"] = (input) => {
  const { model, msgServer } = input

  switch (msgServer?.t) {
    case "pack-builder.list-puzzles-by-id": {
      if (msgServer.listed.t === "err") {
        return {
          model,
          msgCmd: showErrSm(msgServer.listed.error),
        }
      }

      const byId = msgServer.listed.value.reduce(
        (acc, puzzle) => ({ ...acc, [puzzle.id]: puzzle }),
        {},
      )
      return { model: { ...model, puzzles: { ...model.puzzles, ...byId } } }
    }
    default: {
      return { model }
    }
  }
}

const fetchMissingPuzzles: ClientModule["update"] = (input) => {
  const missingPuzzleIds =
    input.modelSync.packBuilder?.pack.puzzleIds.filter(
      (puzzleId) => !input.model.puzzles[puzzleId],
    ) ?? []

  if (missingPuzzleIds.length === 0) {
    return { model: input.model }
  }

  return {
    model: input.model,
    msgCmd: [
      sendToServer({
        t: "pack-builder.list-puzzles-by-id",
        puzzleIds: missingPuzzleIds,
      }),
    ],
  }
}

const updateMissingPuzzles: ClientModule["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    (model) => fetchMissingPuzzles({ ...input, model }),
    (model) => updateServerListedPuzzles({ ...input, model }),
  )
}

const subscriptionsMissingPuzzles: ClientModule["subscriptions"] = (input) => {
  const isMissingPuzzles = input.modelSync.packBuilder?.pack.puzzleIds.some(
    (puzzleId) => !input.model.puzzles[puzzleId],
  )
  if (isMissingPuzzles) {
    return Time.interval(
      "fetch-missing-puzzles",
      TimeSpan.fromSeconds(1),
      () => ({ t: "puzzle-builder.elapsed" }),
    )
  }
  return Sub.None
}

//
//
//
//
//
//

export const PackBuilderClient: Pick<
  ClientModule,
  "update" | "View" | "subscriptions"
> = {
  update(input) {
    return GameClientModule.chainUpdates(
      { model: input.model },
      (model) => ButtonExitBuilder.update({ ...input, model }),
      (model) => ScreenAddPuzzle.update({ ...input, model }),
      (model) => ButtonAddPuzzle.update({ ...input, model }),
      (model) => ScreenPuzzleGrid.update({ ...input, model }),
      (model) => ScreenPuzzle.update({ ...input, model }),
      (model) => updateMissingPuzzles({ ...input, model }),
    )
  },

  View(input) {
    if (input.modelSync.packBuilder?.opened.t === "add-puzzle") {
      return <ScreenAddPuzzle.View {...input} />
    }
    const { modelSync } = input

    switch (modelSync.packBuilder?.screen.t) {
      case "screen-puzzle-grid": {
        return <ScreenPuzzleGrid.View {...input} />
      }

      case "screen-puzzle": {
        return <ScreenPuzzle.View {...input} />
      }

      default: {
        return null
      }
    }
  },

  async subscriptions(input) {
    return Sub.batch([
      //
      await subscriptionsMissingPuzzles(input),
    ])
  },
}
