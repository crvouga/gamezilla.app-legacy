import { Avatar, Button, Drawer } from "gamezilla/@CHILD/app/@SHARED/ui"
import {
  ViewSpaceHostChip,
  ViewUsersInSpaceList,
  ViewYouChip,
} from "../@CHILD/game/@SHARED/game"
import { SpaceClientCtx } from "../@SHARED/space"
import { SpaceClientModule } from "../architecture/architecture"
import {
  APP_SOUND,
  playSound,
  pushRoute,
} from "gamezilla/@CHILD/app/@SHARED/client"

const update: SpaceClientModule["update"] = (input) => {
  const { model } = input
  return SpaceClientModule.chainUpdates(
    { model },
    (model) => updateModals({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
    (model) => updateFromEvent({ ...input, model }),
    (model) => updateUserPreview({ ...input, model }),
  )
}

const updateUserPreview: SpaceClientModule["update"] = ({ msg, model }) => {
  switch (msg?.t) {
    case "clicked-preview-user-link": {
      if (!model.modalPreviewUserId) {
        return { model }
      }

      return {
        model,
        msgCmd: [
          playSound(APP_SOUND.tap),
          pushRoute({
            t: "profile",
            c: { t: "profile", userId: model.modalPreviewUserId },
          }),
        ],
      }
    }

    default: {
      return { model }
    }
  }
}

const updateModals: SpaceClientModule["update"] = ({ msg, model }) => {
  switch (msg?.t) {
    case "closed-modal": {
      return { model: { ...model, modal: null } }
    }

    case "clicked-people-button": {
      return { model: { ...model, modal: "users" } }
    }

    case "clicked-user": {
      return {
        model: {
          ...model,
          modalPreviewUserId: msg.userId,
          modal: "user-preview",
        },
      }
    }
    default: {
      return { model }
    }
  }
}

const updateFromCmd: SpaceClientModule["update"] = ({ msgCmd, model }) => {
  switch (msgCmd?.t) {
    case "space/open-user-details": {
      return {
        model: {
          ...model,
          modalPreviewUserId: msgCmd.userId,
          modal: "user-preview",
        },
      }
    }
    default: {
      return { model }
    }
  }
}

const updateFromEvent: SpaceClientModule["update"] = ({ msgEvt, model }) => {
  switch (msgEvt?.t) {
    case "routing/route-changed": {
      return { model: { ...model, modal: null } }
    }
    default: {
      return { model }
    }
  }
}

const View: SpaceClientModule["View"] = ({ ctx, dispatch, model }) => {
  if (!ctx.space || !ctx.currentUserId) {
    return null
  }

  const spaceCtx: SpaceClientCtx = {
    ...ctx,
    currentUserId: ctx.currentUserId,
    space: ctx.space,
  }
  return (
    <>
      <Drawer
        position="bottom"
        id="users"
        open={model.modal === "users"}
        onClose={() => dispatch({ t: "closed-modal" })}
      >
        <ViewUsersInSpaceList
          onOpenUserDetails={(userId) =>
            dispatch({ t: "clicked-user", userId })
          }
          ctx={spaceCtx}
        />
      </Drawer>
      <Drawer
        position="bottom"
        id="user-preview"
        open={model.modal === "user-preview"}
        onClose={() => dispatch({ t: "closed-modal" })}
      >
        <div>
          <button
            className="flex w-full flex-col items-center justify-center gap-2 p-4"
            onClick={() => dispatch({ t: "clicked-preview-user-link" })}
          >
            <Avatar
              src={
                model.modalPreviewUserId
                  ? ctx.profiles[model.modalPreviewUserId]?.avatarUrl
                  : undefined
              }
              className="h-24 w-24"
            />
            <p className="text-xl font-semibold">
              {model.modalPreviewUserId
                ? ctx.profiles[model.modalPreviewUserId]?.username ?? "..."
                : "..."}
            </p>
            <div className="flex items-center gap-2">
              {spaceCtx.space.hostId === model.modalPreviewUserId && (
                <ViewSpaceHostChip />
              )}
              {spaceCtx.currentUserId === model.modalPreviewUserId && (
                <ViewYouChip />
              )}
            </div>
          </button>

          <div className="w-full px-4 pb-8">
            <Button
              onClick={() => dispatch({ t: "clicked-preview-user-link" })}
              className="w-full"
              text="See profile"
            />
          </div>
        </div>
      </Drawer>
    </>
  )
}

export const Modals = {
  update,
  View,
}
