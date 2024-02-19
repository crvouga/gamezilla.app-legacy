import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { APP_SOUND, playSound } from "gamezilla/@CHILD/app/@SHARED/client"
import {
  Button,
  Drawer,
  IconArrowLeftOnRect,
} from "gamezilla/@CHILD/app/@SHARED/ui"
import { FlowPackUI } from "../../../../@SHARED/flow-pack"
import { FlowPuzzleListClient } from "../../../../@SHARED/flow-puzzle-list"
import { ClientModule } from "../../builder.core"

//
//
//
//
//
//

const ExitButton: Pick<ClientModule, "update" | "View"> = {
  update(input) {
    const { model, msg, ctx, msgGame } = input

    switch (msg?.t) {
      case "pack-builder.user-clicked-exit-button": {
        return {
          model,
          msgGame: [
            withId({
              t: "user-exited-pack-builder",
              userId: ctx.currentUserId,
            }),
          ],
        }
      }
    }

    switch (msgGame?.t) {
      case "user-exited-pack-builder": {
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
          input.dispatch({ t: "pack-builder.user-clicked-exit-button" })
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

const PuzzlePickerDrawer: Pick<ClientModule, "update" | "View"> = {
  update(input) {
    const { model, msg } = input

    switch (msg?.t) {
      case "pack-builder.clicked-add-puzzle-button": {
        return { model: { ...model, packBuilderOpen: "puzzle-picker" } }
      }

      case "pack-builder.closed-puzzle-picker-drawer": {
        return { model: { ...model, packBuilderOpen: null } }
      }
    }

    return { model }
  },

  View(input) {
    const { dispatch, model } = input
    return (
      <Drawer
        id="puzzle-picker"
        position="bottom"
        open={model.packBuilderOpen === "puzzle-picker"}
        onClose={() =>
          dispatch({ t: "pack-builder.closed-puzzle-picker-drawer" })
        }
      >
        <PuzzlePicker.View {...input} />
      </Drawer>
    )
  },
}

const PuzzlePicker: Pick<ClientModule, "update" | "View"> = {
  update(input) {
    const { model, msg } = input

    switch (msg?.t) {
      case "pack-builder.clicked-puzzle-picker-item": {
        return {
          model: {
            ...model,
            packBuilderOpen: null,
          },
          msgGame: [
            withId({
              puzzle: msg.puzzle,
              t: "pack-builder.user-clicked-puzzle-picker-item",
            }),
          ],
        }
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
                  t: "pack-builder.clicked-puzzle-picker-item",
                  puzzle,
                }),
            }}
          />
        </div>
        <div className="flex w-full shrink-0 items-center justify-center border-t border-neutral-700 p-4">
          <Button
            text="Close"
            className="w-full"
            onClick={() =>
              dispatch({ t: "pack-builder.closed-puzzle-picker-drawer" })
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

export const PackBuilderClient: Pick<ClientModule, "update" | "View"> = {
  update(input) {
    return GameClientModule.chainUpdates(
      { model: input.model },
      (model) => ExitButton.update({ ...input, model }),
      (model) => PuzzlePickerDrawer.update({ ...input, model }),
      (model) => PuzzlePicker.update({ ...input, model }),
    )
  },

  View(input) {
    const { dispatch, modelGame, model } = input

    if (modelGame.t !== "pack-builder") {
      return null
    }

    if (model.packBuilderOpen === "puzzle-picker") {
      return <PuzzlePicker.View {...input} />
    }

    return (
      <div className="flex w-full flex-1 flex-col items-center justify-center">
        <div className="flex w-full flex-1 flex-col">
          <p className="w-full p-3 text-3xl font-bold">{modelGame.pack.name}</p>
          <div className="flex w-full flex-1 flex-col items-center justify-center">
            <FlowPackUI.ViewPackPuzzleGrid
              renderCell={(position) => {
                const index = FlowPackUI.toIndex(position)

                const puzzleId = modelGame.pack.puzzleIds[index]

                if (puzzleId) {
                  return (
                    <FlowPackUI.ViewPuzzleCell
                      onClick={() => {}}
                      index={index}
                    />
                  )
                }

                if (index === modelGame.pack.puzzleIds.length) {
                  return (
                    <FlowPackUI.ViewAddCell
                      onClick={() =>
                        dispatch({
                          t: "pack-builder.clicked-add-puzzle-button",
                        })
                      }
                    />
                  )
                }

                return <FlowPackUI.ViewEmptyCell />
              }}
            />
          </div>
        </div>

        <PuzzlePickerDrawer.View {...input} />

        <div className="w-full border-t border-neutral-700 p-4">
          <ExitButton.View {...input} />
        </div>
      </div>
    )
  },
}
