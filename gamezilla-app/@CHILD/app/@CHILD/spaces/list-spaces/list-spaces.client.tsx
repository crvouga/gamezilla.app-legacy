import {
  APP_SOUND,
  playSound,
  pushRoute,
  sendToServer,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import { SpaceId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { IconGamepad, TopBar } from "gamezilla-app/@CHILD/app/@SHARED/ui"
import { EmptyState } from "gamezilla-app/@CHILD/app/@SHARED/ui/empty-state"
import { RequestResponse, ok, requesting } from "gamezilla-app/@SHARED/core"
import { SpaceClientModule } from "../architecture/architecture"
import * as Spaces from "../spaces-core/spaces"
import { StartSpaceClient } from "../start-space/start-space.client"
import { ViewSpaceCard } from "./space-card"

//
//
//
//
//

const sendListSpacesRequest: SpaceClientModule["update"] = ({ model, ctx }) => {
  return {
    model: {
      ...model,
      listSpacesRequest: requesting(ctx.now),
    },
    msgCmd: [sendToServer({ t: "list-spaces", limit: 100, offset: 0 })],
  }
}

//
//
//
//
//
//

const init: SpaceClientModule["init"] = ({ model, ctx }) => {
  return sendListSpacesRequest({ model, ctx })
}

//
//
//
// Update
//
//
//

const update: SpaceClientModule["update"] = (input) => {
  const { ctx, msgServer, model, msgEvt, msg } = input

  switch (msgEvt?.t) {
    case "routing/route-changed": {
      if (msgEvt.route.t === "spaces" && msgEvt.route.c.t === "space-list") {
        return sendListSpacesRequest({ model, ctx })
      }
      return { model }
    }
  }

  switch (msg?.t) {
    case "time-passed": {
      return {
        model: {
          ...model,
          listSpacesRequest: RequestResponse.elapsed(
            model.listSpacesRequest,
            ctx.now,
          ),
        },
      }
    }

    case "clicked-space-card": {
      return {
        model,
        modelLocation: {
          t: "push",
          location: {
            filters: {
              limit: 100,
              offset: 0,
            },
            screen: {
              t: "space",
              spaceId: msg.spaceId,
            },
          },
        },
        msgCmd: [
          pushRoute({
            t: "spaces",
            c: { t: "space", spaceId: msg.spaceId },
          }),
          playSound(APP_SOUND.navForwardMin),
        ],
      }
    }
  }

  switch (msgServer?.t) {
    case "listed-spaces": {
      const merged = Spaces.mergeMany({ model, spaces: msgServer.spaces })
      return {
        model: {
          ...model,
          spaceIdByUserId: merged.spaceIdByUserId,
          spaces: merged.spaces,
          listSpacesRequest: RequestResponse.response(
            model.listSpacesRequest,
            ctx.now,
            ok(null),
          ),
        },
      }
    }
  }

  return { model }
}

//
//
//
// View
//
//
//

const View: SpaceClientModule["View"] = (input) => {
  const { ctx, dispatch, model } = input

  const currentUserId = ctx.currentUserId

  if (!currentUserId) {
    return null
  }

  const currentUserSpaceId = model.spaceIdByUserId[currentUserId]

  const spaces = Object.keys(model.spaces).flatMap((spaceId) => {
    const space = Spaces.toSpaceStarted(model, spaceId as SpaceId)
    if (!space) {
      return []
    }
    return [space]
  })

  return (
    <div className="relative flex w-full flex-1 flex-col overflow-hidden">
      <TopBar title="Spaces" />

      <div className="relative flex w-full flex-1 flex-col overflow-hidden overflow-y-scroll pb-8">
        {spaces.length === 0 && (
          <EmptyState
            renderIcon={(props) => <IconGamepad {...props} />}
            label="No active spaces"
          />
        )}

        <div className="flex w-full flex-1 flex-col gap-5 p-5">
          {spaces.flatMap((state) => {
            return (
              <ViewSpaceCard
                key={state.spaceId}
                ctx={{ ...ctx, currentUserId }}
                onClick={() =>
                  dispatch({ t: "clicked-space-card", spaceId: state.spaceId })
                }
                state={state}
              />
            )
          })}
        </div>
      </div>

      {!currentUserSpaceId && (
        <div className="flex border-t border-neutral-600 p-4">
          <StartSpaceClient.ViewStartSpaceButton {...input} />
        </div>
      )}
    </div>
  )
}

export const ListSpacesClient = {
  init,
  update,
  View,
}
