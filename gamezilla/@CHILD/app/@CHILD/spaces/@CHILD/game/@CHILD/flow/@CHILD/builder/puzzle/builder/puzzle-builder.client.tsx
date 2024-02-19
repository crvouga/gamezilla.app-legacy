import {
  GameLayout,
  ViewBottomButtonBar,
  ViewBottomButtonBarAction,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/game"
import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { APP_SOUND, playSound } from "gamezilla/@CHILD/app/@SHARED/client"
import {
  Drawer,
  IconEllipsisVertical,
  IconPenToSquare,
  IconPlay,
  cn,
} from "gamezilla/@CHILD/app/@SHARED/ui"
import {
  FlowGrid,
  FlowGridUI,
  FlowGridUIEdit,
  FlowGridUIPlay,
} from "../../../../@SHARED/flow"
import { ViewProfileCard } from "../../../../@SHARED/ui"
import { ClientModule, ModelGamePuzzleBuilder } from "../../builder.core"
import { PuzzleDeleteForeverClient } from "../delete-forever/puzzle-delete-forever.client"
import { PuzzleEditNameClient } from "../edit/puzzle-edit-name.client"
import { PuzzleSaveChangesClient } from "../save-changes/puzzle-save-changes.client"
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { VDom } from "gamezilla/@SHARED/vdom"

//
//
//
//
//
//
//

const update: ClientModule["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsgGame({ ...input, model }),
    (model) => updateMoreDrawer({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
  )
}

const updateFromMsg: ClientModule["update"] = (input) => {
  const { model, msg, ctx } = input

  switch (msg?.t) {
    case "puzzle-builder.flow-grid-ui-edit": {
      return {
        model,
        msgGame: [withId({ t: "puzzle-builder.grid-ui-edit", c: msg.c })],
      }
    }

    case "puzzle-builder.flow-grid-ui-play": {
      return {
        model,
        msgGame: [withId({ t: "puzzle-builder.grid-ui-play", c: msg.c })],
      }
    }

    case "puzzle-builder.user-clicked-edit-mode-button": {
      return {
        model,
        msgGame: [
          withId({
            t: "puzzle-builder.user-clicked-edit-mode-button",
            userId: ctx.currentUserId,
          }),
        ],
        msgCmd: [playSound(APP_SOUND.navBackwardMin)],
      }
    }
    case "puzzle-builder.user-clicked-play-mode-button": {
      return {
        model,
        msgGame: [
          withId({
            t: "puzzle-builder.user-clicked-play-mode-button",
            userId: ctx.currentUserId,
          }),
        ],
        msgCmd: [playSound(APP_SOUND.navForwardMin)],
      }
    }
    case "puzzle-builder.user-clicked-more-button": {
      return {
        model: { ...model, opened: "more" },
        msgCmd: [playSound(APP_SOUND.tap)],
      }
    }
    case "puzzle-builder.user-closed-more-drawer": {
      return {
        model: { ...model, opened: null },
        msgCmd: [playSound(APP_SOUND.tap)],
      }
    }
    default: {
      return { model }
    }
  }
}

const updateFromMsgGame: ClientModule["update"] = (input) => {
  const { model, modelGame, msgGame } = input

  switch (msgGame?.t) {
    case "puzzle-builder.grid-ui-edit": {
      if (!modelGame.puzzleBuilder) {
        return { model }
      }
      if (modelGame.puzzleBuilder.mode.t !== "edit") {
        return { model }
      }
      const updated = FlowGridUIEdit.update({
        model: modelGame.puzzleBuilder.gridEdit,
        msg: msgGame.c,
        grid: modelGame.puzzleBuilder.puzzle.puzzle.c,
      })

      if (!updated.msgCmd) {
        return { model }
      }

      switch (updated.msgCmd.t) {
        case "play-sound": {
          return {
            model,
            msgCmd: [playSound(updated.msgCmd.sourceSrc)],
          }
        }
      }
    }

    default: {
      return { model }
    }
  }
}

//
//
//
//
//
//
//

const View: ClientModule["View"] = (input) => {
  const { ctx } = input

  const isSpectating = ctx.currentUserId !== ctx.space.hostId

  if (isSpectating) {
    return <ViewSpectating {...input} />
  }

  return (
    <>
      <ViewMode {...input} />
      <ViewMoreDrawer {...input} />
      <PuzzleSaveChangesClient.ViewUnsavedChangesDrawer {...input} />
    </>
  )
}

const ViewMode: ClientModule["View"] = (input) => {
  const { model, modelGame, dispatch } = input

  const puzzleBuilder = modelGame.puzzleBuilder

  if (!puzzleBuilder) {
    return null
  }

  const more = (
    <ViewBottomButtonBarAction
      icon={<IconEllipsisVertical className="h-6 w-6" />}
      label="More"
      onClick={() => dispatch({ t: "puzzle-builder.user-clicked-more-button" })}
    />
  )

  switch (puzzleBuilder.mode.t) {
    case "edit": {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <ViewModeBar
            icon={(props) => <IconPenToSquare {...props} />}
            label="Edit Mode"
            color="yellow"
          />

          <div className="flex w-full flex-1 flex-col items-center justify-center overflow-hidden">
            <FlowGridUIEdit.View
              model={puzzleBuilder.gridEdit}
              dispatch={(c) =>
                dispatch({
                  t: "puzzle-builder.flow-grid-ui-edit",
                  c,
                })
              }
            />
          </div>

          <ViewBottomButtonBar>
            <PuzzleSaveChangesClient.ViewActionButtons
              {...input}
              model={model}
            />

            <ViewBottomButtonBarAction
              icon={<IconPlay className="h-6 w-6" />}
              label="Play Mode"
              classNames={{
                button: "text-blue-500",
              }}
              onClick={() =>
                dispatch({
                  t: "puzzle-builder.user-clicked-play-mode-button",
                })
              }
            />
            {more}
          </ViewBottomButtonBar>
        </div>
      )
    }

    case "play": {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <ViewModeBar
            icon={(props) => <IconPlay {...props} />}
            label="Play Mode"
            color="blue"
          />

          <div className="flex w-full flex-1 flex-col items-center justify-center overflow-hidden">
            <FlowGridUIPlay.View
              model={puzzleBuilder.gridPlay}
              grid={toCurrentGrid(puzzleBuilder)}
              dispatch={(c) =>
                dispatch({
                  t: "puzzle-builder.flow-grid-ui-play",
                  c,
                })
              }
            />
          </div>

          <ViewBottomButtonBar>
            <PuzzleSaveChangesClient.ViewActionButtons
              {...input}
              model={model}
            />

            <ViewBottomButtonBarAction
              icon={<IconPenToSquare className="h-6 w-6" />}
              label="Edit Mode"
              classNames={{
                button: "text-amber-500",
              }}
              onClick={() =>
                dispatch({
                  t: "puzzle-builder.user-clicked-edit-mode-button",
                })
              }
            />
            {more}
          </ViewBottomButtonBar>
        </div>
      )
    }
  }
}

export const toCurrentGrid = (
  modelGame: ModelGamePuzzleBuilder,
): FlowGrid.Model => {
  switch (modelGame.mode.t) {
    case "edit": {
      return FlowGridUIEdit.toCurrentGrid({
        model: modelGame.gridEdit,
      })
    }

    case "play": {
      return FlowGridUIPlay.toCurrentGrid({
        grid: FlowGridUIEdit.toCurrentGrid({
          model: modelGame.gridEdit,
        }),
        model: modelGame.gridPlay,
      })
    }
  }
}

const ViewSpectating: ClientModule["View"] = ({ modelGame, ctx }) => {
  if (!modelGame.puzzleBuilder) {
    return null
  }

  return (
    <GameLayout isSpectating>
      <div className="flex w-full flex-1 flex-col items-center justify-center overflow-y-scroll">
        <ViewProfileCard
          profile={ctx.profiles[ctx.space.hostId]}
          subtitle="Editor"
        />
        <FlowGridUI.View
          disabled
          model={toCurrentGrid(modelGame.puzzleBuilder)}
        />
      </div>
    </GameLayout>
  )
}

const ViewModeBar = (props: {
  icon: (props: { className: string }) => VDom
  label: string
  color: "blue" | "yellow"
}) => {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center gap-2 p-1 text-xs font-bold text-white",
        props.color === "blue" ? "bg-blue-500" : "bg-amber-500",
      )}
    >
      {props.icon({ className: "h-4 w-4" })}
      {props.label}
    </div>
  )
}

export const capitalize = (s: string) => {
  return `${s.charAt(0).toUpperCase()}${s.slice(1).toLowerCase()}`
}

//
//
//
//
//
//
//

const updateMoreDrawer: ClientModule["update"] = (input) => {
  const { msg, model } = input
  switch (msg?.t) {
    case "puzzle-builder.user-closed-more-drawer": {
      return { model: { ...model, opened: null } }
    }
    case "puzzle-builder.user-clicked-more-button": {
      return { model: { ...model, opened: "more" } }
    }
    default: {
      return { model }
    }
  }
}

export const ViewMoreDrawer: ClientModule["View"] = (input) => {
  const { dispatch } = input
  return (
    <Drawer
      id="more-drawer"
      open={input.model.opened === "more"}
      onClose={() => dispatch({ t: "puzzle-builder.user-closed-more-drawer" })}
      position="bottom"
    >
      <PuzzleEditNameClient.View {...input} />
      <PuzzleDeleteForeverClient.View {...input} />
      <div className="w-full pb-2"></div>
    </Drawer>
  )
}

//
//
//
//
//
//

export const PuzzleBuilderClient = {
  update,
  View,
}
