import {
  GameLayout,
  ViewBottomButtonBar,
  ViewBottomButtonBarAction,
} from "gamezilla-app/app/spaces/game/@shared/game"
import { GameClientModule } from "gamezilla-app/app/spaces/@shared/architecture/game-client-v2"
import { withId } from "gamezilla-app/app/spaces/@shared/event"
import { APP_SOUND, playSound } from "gamezilla-app/app/@shared/client"
import {
  Drawer,
  IconEllipsisVertical,
  IconPenToSquare,
  IconPlay,
  cn,
} from "gamezilla-app/app/@shared/ui"
import { VDom } from "gamezilla-app/@/vdom"
import {
  FlowVariantUI,
  FlowVariantUIEdit,
  FlowVariantUIPlay,
} from "../../../@shared/flow"
import { ViewProfileCard } from "../../../@shared/ui"
import { ClientModule } from "../../create.core"
import { PuzzleDeleteForeverClient } from "../delete-forever/puzzle-delete-forever.client"
import { PuzzleEditNameClient } from "../edit/puzzle-edit-name.client"
import { PuzzleSaveChangesClient } from "../save-changes/puzzle-save-changes.client"
import { toCurrentFlow } from "./puzzle-builder.core"

//
//
//
//
//
//
//

const update: ClientModule["update"] = (input) => {
  return GameClientModule.andThen(
    { model: input.model },
    (model) => updateFromMsgSync({ ...input, model }),
    (model) => updateMoreDrawer({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
  )
}

const updateFromMsg: ClientModule["update"] = (input) => {
  const { model, msg, ctx } = input

  switch (msg?.t) {
    case "puzzle-builder.flow-ui-edit": {
      return {
        model,
        msgSync: [withId({ t: "puzzle-builder.flow-ui-edit", c: msg.c })],
      }
    }

    case "puzzle-builder.flow-ui-play": {
      return {
        model,
        msgSync: [withId({ t: "puzzle-builder.flow-ui-play", c: msg.c })],
      }
    }

    case "puzzle-builder.user-clicked-edit-mode-button": {
      return {
        model,
        msgSync: [
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
        msgSync: [
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
        model: { ...model, puzzleBuilderOpened: "more" },
        msgCmd: [playSound(APP_SOUND.tap)],
      }
    }
    case "puzzle-builder.user-closed-more-drawer": {
      return {
        model: { ...model, puzzleBuilderOpened: null },
        msgCmd: [playSound(APP_SOUND.tap)],
      }
    }
    default: {
      return { model }
    }
  }
}

const updateFromMsgSync: ClientModule["update"] = (input) => {
  const { model, modelSync, msgSync } = input

  switch (msgSync?.t) {
    case "puzzle-builder.flow-ui-edit": {
      if (!modelSync.puzzleBuilder) {
        return { model }
      }
      if (modelSync.puzzleBuilder.mode.t !== "edit") {
        return { model }
      }
      const updated = FlowVariantUIEdit.update({
        model: modelSync.puzzleBuilder.edit,
        msg: msgSync.c,
        flow: modelSync.puzzleBuilder.puzzle.flow,
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
  const { model, modelSync, dispatch } = input

  const puzzleBuilder = modelSync.puzzleBuilder

  if (!puzzleBuilder) {
    return null
  }

  const more = (
    <ViewBottomButtonBarAction
      icon={(props) => <IconEllipsisVertical {...props} />}
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
            <FlowVariantUIEdit.View
              model={puzzleBuilder.edit}
              dispatch={(c) =>
                dispatch({
                  t: "puzzle-builder.flow-ui-edit",
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
              icon={(props) => <IconPlay {...props} />}
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
            <FlowVariantUIPlay.View
              model={puzzleBuilder.play}
              flow={toCurrentFlow(puzzleBuilder)}
              dispatch={(c) =>
                dispatch({
                  t: "puzzle-builder.flow-ui-play",
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
              icon={(props) => <IconPenToSquare {...props} />}
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

const ViewSpectating: ClientModule["View"] = (input) => {
  if (!input.modelSync.puzzleBuilder) {
    return null
  }

  return (
    <GameLayout isSpectating>
      <div className="flex w-full flex-1 flex-col items-center justify-center overflow-y-scroll">
        <ViewProfileCard
          profile={input.ctx.profiles[input.ctx.space.hostId]}
          subtitle="Editor"
        />
        <FlowVariantUI.View
          disabled
          model={toCurrentFlow(input.modelSync.puzzleBuilder)}
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
      return { model: { ...model, puzzleBuilderOpened: null } }
    }
    case "puzzle-builder.user-clicked-more-button": {
      return { model: { ...model, puzzleBuilderOpened: "more" } }
    }
    default: {
      return { model }
    }
  }
}

export const ViewMoreDrawer: ClientModule["View"] = (input) => {
  return (
    <Drawer
      id="more-drawer"
      open={input.model.puzzleBuilderOpened === "more"}
      onClose={() =>
        input.dispatch({ t: "puzzle-builder.user-closed-more-drawer" })
      }
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
