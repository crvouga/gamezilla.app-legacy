import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { APP_SOUND, playSound } from "gamezilla/@CHILD/app/@SHARED/client"
import { Drawer, IconArrowLeftOnRect } from "gamezilla/@CHILD/app/@SHARED/ui"
import { ViewBottomButtonBar } from "../../../../../../@SHARED/game"
import { FlowPackUI } from "../../../../@SHARED/flow-pack"
import { ClientModule } from "../../builder.core"
import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"

const update: ClientModule["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    (model) => updateExit({ ...input, model }),
    (model) => PuzzlePickerDrawer.update({ ...input, model }),
  )
}

const updateExit: ClientModule["update"] = (input) => {
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
}

const View: ClientModule["View"] = (input) => {
  const { dispatch, modelGame } = input

  if (modelGame.t !== "pack-builder") {
    return null
  }

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center">
      <div className="flex w-full flex-1 flex-col">
        <p className="w-full p-3 text-3xl font-bold">{modelGame.pack.name}</p>
        <div className="flex w-full flex-1 flex-col items-center justify-center">
          <FlowPackUI.ViewPackPuzzleGrid
            renderCell={(position) => {
              const index = FlowPackUI.toIndex(position)

              if (index === 0) {
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

      <ViewBottomButtonBar
        actions={[
          {
            icon: <IconArrowLeftOnRect className="h-6 w-6" />,
            label: "Exit",
            onClick: () =>
              dispatch({
                t: "pack-builder.user-clicked-exit-button",
              }),
          },
        ]}
      />
    </div>
  )
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
        hello
      </Drawer>
    )
  },
}

//
//
//
//
//
//

export const PackBuilderClient = {
  update,
  View,
}
