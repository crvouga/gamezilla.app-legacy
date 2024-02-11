import { pushRoute } from "gamezilla/@CHILD/app/@SHARED/client"
import { SpaceClientModule } from "../architechure/space-client"
import { Avatar, Button, Drawer } from "gamezilla/@CHILD/app/@SHARED/ui"
import {
  ViewSpaceHostChip,
  ViewUsersInSpaceList,
  ViewYouChip,
} from "../@CHILD/game/@SHARED/game"
import { SpaceClientCtx } from "../@SHARED/space"

const update: SpaceClientModule["update"] = ({
  msg,
  msgEvt,
  msgCmd,
  model,
}) => {
  switch (msgEvt?.t) {
    case "routing/route-changed": {
      return { model: { ...model, modal: null } }
    }
  }

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
  }

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

    case "clicked-link": {
      return {
        model,
        msgCmd: [pushRoute(msg.route)],
      }
    }
  }

  return { model }
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
            onClick={() => {
              if (model.modalPreviewUserId) {
                dispatch({
                  t: "clicked-link",
                  route: {
                    t: "profile",
                    c: {
                      t: "profile",
                      userId: model.modalPreviewUserId,
                    },
                  },
                })
              }
            }}
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
              onClick={() => {
                if (model.modalPreviewUserId) {
                  dispatch({
                    t: "clicked-link",
                    route: {
                      t: "profile",
                      c: {
                        t: "profile",
                        userId: model.modalPreviewUserId,
                      },
                    },
                  })
                }
              }}
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
