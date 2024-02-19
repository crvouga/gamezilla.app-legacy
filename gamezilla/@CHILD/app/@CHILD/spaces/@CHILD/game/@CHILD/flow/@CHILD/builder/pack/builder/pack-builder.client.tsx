import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { APP_SOUND, playSound } from "gamezilla/@CHILD/app/@SHARED/client"
import { Button, IconArrowLeftOnRect } from "gamezilla/@CHILD/app/@SHARED/ui"
import {
  ViewBottomButtonBar,
  ViewBottomButtonBarAction,
} from "../../../../../../@SHARED/game"
import { FlowPackUI } from "../../../../@SHARED/flow-pack"
import { FlowPuzzleListClient } from "../../../../@SHARED/flow-puzzle-list"
import { ClientModule } from "../../builder.core"
import { FlowGridUIPlay } from "../../../../@SHARED/flow"

//
//
//
//
//
//

const ExitButton: Pick<ClientModule, "update" | "View"> = {
  update(input) {
    const { model, msg, msgGame } = input

    switch (msg?.t) {
      case "pack-builder.user-clicked-exit-button": {
        return { model, msgGame: [withId(msg)] }
      }
    }

    switch (msgGame?.t) {
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

const AddPuzzleButton: Pick<ClientModule, "update" | "View"> = {
  update(input) {
    const { model, msg } = input

    switch (msg?.t) {
      case "pack-builder.user-clicked-open-add-puzzle-button": {
        return { model, msgGame: [withId(msg)] }
      }
    }
    return { model }
  },

  View(input) {
    return (
      <FlowPackUI.ViewAddCell
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

const PuzzlePicker: Pick<ClientModule, "update" | "View"> = {
  update(input) {
    const { model, msg } = input

    switch (msg?.t) {
      case "pack-builder.user-clicked-add-puzzle-item": {
        return { model, msgGame: [withId(msg)] }
      }

      case "pack-builder.user-closed-add-puzzle": {
        return { model, msgGame: [withId(msg)] }
      }
    }

    return { model }
  },

  View(input) {
    const { dispatch, model } = input
    return (
      <div className="flex h-full max-h-full w-full flex-col overflow-hidden">
        <div className="flex w-full shrink-0 items-center border-b border-neutral-700 px-4 py-2 text-2xl font-bold">
          <p className="flex-1">Add puzzle</p>
        </div>
        <div className="h-full max-h-full w-full max-w-full flex-1 overflow-hidden overflow-y-scroll">
          <FlowPuzzleListClient.View
            ctx={input.ctx}
            dispatch={(c) => input.dispatch({ t: "flow-puzzle-list", c })}
            model={model.flowPuzzleList}
            emits={{
              clickedPuzzleItem: (puzzle) =>
                dispatch({
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
              dispatch({ t: "pack-builder.user-closed-add-puzzle" })
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

const PuzzleGrid: Pick<ClientModule, "update" | "View"> = {
  update(input) {
    const { model, msg } = input

    switch (msg?.t) {
      case "pack-builder.user-clicked-pack-item": {
        return { model, msgGame: [withId(msg)] }
      }
    }

    return { model }
  },
  View(input) {
    const { modelGame, model } = input

    const packBuilder = modelGame.packBuilder

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
            <FlowPackUI.ViewPackPuzzleGrid
              renderCell={(position) => {
                const index = FlowPackUI.toIndex(position)

                const puzzleId = packBuilder.pack.puzzleIds[index]

                if (puzzleId) {
                  const puzzle = puzzleId ? model.puzzles[puzzleId] : null

                  if (!puzzle) {
                    return <FlowPackUI.ViewEmptyCell />
                  }

                  return (
                    <FlowPackUI.ViewPuzzleCell
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
                  return <AddPuzzleButton.View {...input} />
                }

                return <FlowPackUI.ViewEmptyCell />
              }}
            />
          </div>
        </div>

        <div className="w-full border-t border-neutral-700 p-4">
          <ExitButton.View {...input} />
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

export const Puzzle: Pick<ClientModule, "update" | "View"> = {
  update(input) {
    const { model, msg } = input

    switch (msg?.t) {
      case "pack-builder.user-clicked-exit-puzzle-button": {
        return { model, msgGame: [withId(msg)] }
      }
    }

    return { model }
  },

  View(input) {
    if (!input.modelGame.packBuilder) {
      return null
    }

    if (input.modelGame.packBuilder.opened.t !== "puzzle") {
      return null
    }

    const { flowGridUIPlay, flowGrid } =
      input.modelGame.packBuilder.opened.puzzle

    return (
      <div className="flex h-full w-full flex-col ">
        <div>
          <FlowGridUIPlay.View
            dispatch={() => {
              // input.dispatch({ t: "flow-grid-ui-play", c })
            }}
            grid={flowGrid}
            model={flowGridUIPlay}
          />
        </div>
        <ViewBottomButtonBar>
          <ViewBottomButtonBarAction
            icon={<IconArrowLeftOnRect />}
            label="Exit"
            onClick={() =>
              input.dispatch({
                t: "pack-builder.user-clicked-exit-puzzle-button",
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

export const PackBuilderClient: Pick<ClientModule, "update" | "View"> = {
  update(input) {
    return GameClientModule.chainUpdates(
      { model: input.model },
      (model) => ExitButton.update({ ...input, model }),
      (model) => PuzzlePicker.update({ ...input, model }),
      (model) => AddPuzzleButton.update({ ...input, model }),
      (model) => PuzzleGrid.update({ ...input, model }),
      (model) => Puzzle.update({ ...input, model }),
    )
  },

  View(input) {
    const { modelGame } = input

    if (!modelGame.packBuilder) {
      return null
    }
    switch (modelGame.packBuilder.opened.t) {
      case "add-puzzle": {
        return <PuzzlePicker.View {...input} />
      }

      case "puzzle": {
        return <Puzzle.View {...input} />
      }

      case "pack": {
        return <PuzzleGrid.View {...input} />
      }
    }
  },
}
