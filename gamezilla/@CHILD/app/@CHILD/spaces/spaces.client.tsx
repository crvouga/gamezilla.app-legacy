import {
  ViewGameHeader,
  ViewSpaceHostChip,
  ViewUsersInSpaceList,
  ViewYouChip,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/game"
import {
  WithEventId,
  withId,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { FeedItem } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/feed-item"
import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import {
  ClientCtx,
  addProfiles,
  sendToServer,
} from "gamezilla/@CHILD/app/@SHARED/client"
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data"
import {
  Avatar,
  Button,
  Drawer,
  IconHome,
  IconUserGroup,
  IconXMark,
  VDom,
} from "gamezilla/@CHILD/app/@SHARED/ui"
import { Eff, Sub, batchMsgs, notAsked } from "gamezilla/@SHARED/core"
import { CoverArt } from "./@CHILD/game/game-cover-art"
import { Game } from "./@CHILD/game/game.client"
import { gameNameList, gameNameToString } from "./@CHILD/game/game.core"
import { SpaceClientModule } from "./architechure/space-client"
import { EndSpaceClient } from "./end-space/end-space.client"
import { GameClient } from "./game/game.client"
import { JoinSpaceClient } from "./join-space/join-space.client"
import { LeaveSpaceClient } from "./leave-space/leave-space.client"
import { ListSpacesClient } from "./list-spaces/list-spaces.client"
import { Modals } from "./modals/modals"
import { SpaceEvent } from "./spaces-core/space-event"
import * as SpaceState from "./spaces-core/space-state"
import * as Spaces from "./spaces-core/spaces"
import { ClientModule, ModelClient, MsgClient } from "./spaces.core"
import { StartSpaceClient } from "./start-space/start-space.client"
import { SyncClient } from "./sync/sync.client"

//
//
//
// Model
//
//
//

export const init: ClientModule["init"] = async ({ ctx }) => {
  const model: ModelClient = {
    ...Spaces.init,
    games: {},
    modal: null,
    modalPreviewUserId: null,
    listSpacesRequest: notAsked,
  }
  const listSpaces = await ListSpacesClient.init({ ctx, model })
  return {
    model: {
      ...model,
      ...listSpaces.model,
    },
    eff: Eff.batch([listSpaces.eff]),
    msgCmd: batchMsgs(listSpaces.msgCmd),
    msgEvt: batchMsgs(listSpaces.msgEvt),
  }
}

//
//
//
// Update
//
//
//

export const update: ClientModule["update"] = (input) => {
  return AppClientModule.chainUpdates(
    { model: input.model },

    (model) => updateProfiles({ ...input, model }),
    (model) => updateMainLoop({ ...input, model }),
  )
}

const updateProfiles: SpaceClientModule["update"] = ({ model, msgServer }) => {
  if (msgServer?.profiles) {
    return {
      model,
      msgCmd: [addProfiles(msgServer.profiles)],
    }
  }

  return { model }
}

const updateMainLoop: ClientModule["update"] = async (input) => {
  const output = await updateMain(input)

  while (true) {
    const [spaceEvent, ...spaceEventsRest] = output.msgSpaceEvent ?? []

    if (!spaceEvent) {
      return output
    }

    const updated = await updateMain({
      ctx: input.ctx,
      model: output.model,
      msgSpaceEvent: spaceEvent,
    })

    output.model = updated.model
    output.msgSpaceEvent = batchMsgs(spaceEventsRest, updated.msgSpaceEvent)
    output.eff = Eff.batch([output.eff, updated.eff])
    output.msgCmd = batchMsgs(output.msgCmd, updated.msgCmd)
    output.msgSpaceEvent = batchMsgs(
      output.msgSpaceEvent,
      updated.msgSpaceEvent,
    )
  }
}

const updateMain: SpaceClientModule["update"] = (input) => {
  if (
    input.msgSpaceEvent &&
    Spaces.hasEvent(
      input.model,
      input.msgSpaceEvent.spaceId,
      input.msgSpaceEvent.eventId,
    )
  ) {
    return { model: input.model }
  }

  return SpaceClientModule.chainUpdates(
    { model: input.model },
    (model) => outputSpaceEvent({ ...input, model }),
    (model) => SyncClient.update({ ...input, model }),
    (model) => Modals.update({ ...input, model }),
    //
    (model) => EndSpaceClient.update({ ...input, model }),
    (model) => LeaveSpaceClient.update({ ...input, model }),
    //
    (model) => updateSpacesFromSpaceEvent({ ...input, model }),
    //
    (model) => GameClient.update({ ...input, model }),
    (model) => StartSpaceClient.update({ ...input, model }),
    (model) => JoinSpaceClient.update({ ...input, model }),
    (model) => ListSpacesClient.update({ ...input, model }),
    (model) => sendSpaceEventToServer({ ...input, model }),
  )
}

const outputSpaceEvent: SpaceClientModule["update"] = (input) => {
  const { msg, model, msgServer } = input

  switch (msg?.t) {
    case "event": {
      return {
        model,
        msgSpaceEvent: [msg.c],
      }
    }
  }

  switch (msgServer?.t) {
    case "event": {
      return {
        model,
        msgSpaceEvent: [msgServer.c],
      }
    }
  }

  return { model }
}

const updateSpacesFromSpaceEvent: SpaceClientModule["update"] = ({
  msgSpaceEvent,
  model,
}) => {
  if (!msgSpaceEvent) {
    return { model }
  }

  const updated = Spaces.updateFromSpaceEvent({
    model,
    spaceEvent: msgSpaceEvent,
  })

  return { model: { ...model, ...updated.model } }
}

const sendSpaceEventToServer: SpaceClientModule["update"] = ({
  ctx,
  model,
  msgSpaceEvent,
}) => {
  if (!msgSpaceEvent) {
    return { model }
  }

  const msgEvtWithMeta = Spaces.toEventWithMeta(
    model,
    msgSpaceEvent.spaceId,
    msgSpaceEvent.eventId,
  )

  if (!msgEvtWithMeta) {
    return { model }
  }

  const profile =
    "userId" in msgEvtWithMeta ? ctx.profiles[msgEvtWithMeta.userId] : null

  const profiles = profile ? { [profile.userId]: profile } : {}

  return {
    model,
    msgCmd: [sendToServer({ t: "event", c: msgEvtWithMeta, profiles })],
  }
}

//
//
//
//
// Subscriptions
//
//
//
//

export const subscriptions: ClientModule["subscriptions"] = (input) => {
  return Sub.batch([
    //
    GameClient.subscriptions(input),
  ])
}

//
//
//
//
// View
//
//
//
//

export const View = ({
  ctx,
  dispatch,
  model,
  viewBottomBar,
}: {
  model: ModelClient
  ctx: ClientCtx
  dispatch: (m: MsgClient) => void
  viewBottomBar: VDom
}): VDom => {
  const dispatchEvent = (m: SpaceEvent) => {
    dispatch({ t: "event", c: withId(m) })
  }
  switch (ctx.currentRoute.t) {
    case "spaces": {
      switch (ctx.currentRoute.c.t) {
        case "space-list": {
          return (
            <>
              <ListSpacesClient.View
                dispatch={dispatch}
                ctx={ctx}
                model={model}
              />

              {viewBottomBar}
            </>
          )
        }

        case "space": {
          return (
            <ViewSpaceScreen
              dispatchEvent={dispatchEvent}
              spaceId={ctx.currentRoute.c.spaceId}
              ctx={ctx}
              dispatch={dispatch}
              model={model}
            />
          )
        }
      }
    }
    default: {
      return null
    }
  }
}

const ViewSpaceScreen = ({
  ctx,
  dispatchEvent,
  dispatch,
  model,
  spaceId,
}: {
  model: ModelClient
  ctx: ClientCtx
  dispatchEvent: (m: SpaceEvent) => void
  dispatch: (m: MsgClient) => void
  spaceId: SpaceId
}) => {
  const spaceState = Spaces.toSpaceState(model, spaceId)

  switch (spaceState.type) {
    case "ended": {
      return <ViewSpaceEnded dispatch={dispatch} />
    }

    case "initial": {
      return <ViewSpaceNotFound dispatch={dispatch} />
    }

    case "started": {
      return (
        <ViewSpaceStarted
          ctx={ctx}
          dispatchEvent={dispatchEvent}
          dispatch={dispatch}
          model={model}
          spaceState={spaceState}
        />
      )
    }
  }
}

const ViewSpaceStarted = ({
  ctx,
  dispatchEvent,
  dispatch,
  model,
  spaceState,
}: {
  model: ModelClient
  ctx: ClientCtx
  dispatchEvent: (m: SpaceEvent) => void
  dispatch: (m: MsgClient) => void
  spaceState: SpaceState.Started
}) => {
  const spaceCtx: SpaceClientCtx = {
    ...ctx,
    space: spaceState,
    viewProfile: (userId) => {
      dispatch({ t: "clicked-user", userId: userId })
    },
    quit: () => {
      dispatchEvent({
        t: "user-inputted-game",
        spaceId: spaceState.spaceId,
        userId: ctx.currentUserId,
        game: null,
      })
    },
  }

  return (
    <>
      <ViewSpaceScreenMain
        space={spaceState}
        dispatchEvent={dispatchEvent}
        dispatch={dispatch}
        model={model}
        ctx={spaceCtx}
      />

      <Drawer
        position="bottom"
        id="users"
        open={model.modal === "users"}
        onClose={() => dispatch({ t: "closed-modal" })}
      >
        <ViewUsersInSpaceList ctx={spaceCtx} />
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

const ViewFeed = ({
  spaceState,
  ctx,
  model,
}: {
  spaceState: SpaceState.State
  dispatch: (m: MsgClient) => void
  model: ModelClient
  ctx: SpaceClientCtx
}) => {
  const msgEvt =
    spaceState.type === "started"
      ? Spaces.toEventWithMeta(
          model,
          spaceState.spaceId,
          spaceState.latestEvent,
        )
      : null

  return (
    <div className="flex h-6 w-full items-center justify-center border-b border-neutral-600 p-1">
      {spaceState.type === "started" && msgEvt ? (
        <ViewFeedItem ctx={ctx} msgEvt={msgEvt} state={spaceState} />
      ) : null}
    </div>
  )
}

const ViewFeedItem = ({
  ctx,
  msgEvt,
  state,
}: {
  ctx: SpaceClientCtx
  msgEvt: WithEventId<SpaceEvent>
  state: SpaceState.Started
}) => {
  switch (msgEvt.t) {
    case "game": {
      if (!state.game) {
        return null
      }
      return (
        <Game.ViewFeedItem
          ctx={ctx}
          msgGame={{ ...msgEvt, ...msgEvt.c }}
          modelGame={state.game}
          dispatch={(_msg) => {
            //
          }}
        />
      )
    }

    case "user-ended-space": {
      const profile = ctx.profiles[msgEvt.userId]
      return (
        <FeedItem.Info
          text={`${profile?.username ?? "Someone"} ended the space`}
        />
      )
    }

    case "user-inputted-game": {
      const profile = ctx.profiles[msgEvt.userId]
      if (!msgEvt.game) {
        return (
          <FeedItem.Info
            text={`${profile?.username ?? "Someone"} quit the game`}
          />
        )
      }
      return (
        <FeedItem.Info
          text={`${profile?.username ?? "Someone"} started a game`}
        />
      )
    }

    case "user-joined-space": {
      const profile = ctx.profiles[msgEvt.userId]
      return (
        <FeedItem.Info
          text={`${profile?.username ?? "Someone"} joined the space`}
        />
      )
    }

    case "user-left-space": {
      const profile = ctx.profiles[msgEvt.userId]
      return (
        <FeedItem.Info
          text={`${profile?.username ?? "Someone"} left the space`}
        />
      )
    }

    case "user-started-space": {
      const profile = ctx.profiles[msgEvt.userId]
      return (
        <FeedItem.Info
          text={`${profile?.username ?? "Someone"} started the space`}
        />
      )
    }
  }
}

const ViewSpaceScreenMain = (input: {
  space: SpaceState.Started
  model: ModelClient
  ctx: SpaceClientCtx
  dispatch: (m: MsgClient) => void
  dispatchEvent: (m: SpaceEvent) => void
}) => {
  const { ctx, space, model, dispatch, dispatchEvent } = input

  const currentUserSpaceId = Spaces.toSpaceIdByUserId(model, ctx.currentUserId)

  if (currentUserSpaceId !== space.spaceId) {
    return <JoinSpaceClient.View {...input} />
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <ViewTopBar {...input} />

      <ViewFeed
        spaceState={space}
        ctx={ctx}
        model={model}
        dispatch={dispatch}
      />

      <div className="flex w-full flex-1 flex-col overflow-hidden">
        <ViewGame
          ctx={ctx}
          dispatch={dispatch}
          dispatchEvent={dispatchEvent}
          model={model}
          space={space}
        />
      </div>
    </div>
  )
}

const ViewGame = ({
  space,
  model,
  ctx,
  dispatch,
  dispatchEvent,
}: {
  space: SpaceState.Started
  model: ModelClient
  ctx: SpaceClientCtx
  dispatch: (m: MsgClient) => void
  dispatchEvent: (m: SpaceEvent) => void
}) => {
  if (space.game) {
    return (
      <Game.View
        modelGame={space.game}
        ctx={ctx}
        dispatch={(c) => dispatch({ t: "game", spaceId: ctx.space.spaceId, c })}
        model={model.games[ctx.space.spaceId] ?? Game.init(space.game.t)}
      />
    )
  }

  return <ViewScreenNotInGame ctx={ctx} dispatchEvent={dispatchEvent} />
}

export const ViewScreenNotInGame = ({
  ctx,

  dispatchEvent,
}: {
  ctx: SpaceClientCtx
  dispatchEvent: (m: SpaceEvent) => void
}) => {
  if (ctx.space.hostId !== ctx.currentUserId) {
    return (
      <div className="flex h-full w-full flex-1 flex-col">
        <ViewGameHeader />
        <ViewUsersInSpaceList ctx={ctx} />
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col gap-4 p-4">
      <h1 className="text-center text-3xl font-bold">Games</h1>

      <div className="grid grid-cols-3 justify-between gap-8">
        {gameNameList.map((gameName) => (
          <div key={gameName}>
            <button
              aria-label={gameName}
              onClick={() =>
                dispatchEvent({
                  t: "user-inputted-game",
                  spaceId: ctx.space.spaceId,
                  userId: ctx.currentUserId,
                  game: gameName,
                })
              }
              className="flex overflow-hidden rounded-lg border border-neutral-600"
            >
              <CoverArt gameName={gameName} />
            </button>

            <p className="mt-2 w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-semibold">
              {gameNameToString(gameName)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

const ViewTopBar: SpaceClientModule["View"] = (input) => {
  const { ctx, dispatch } = input
  const { space, currentUserId } = ctx

  if (!space || !currentUserId) {
    return null
  }

  const peopleCount = Object.keys(space.users).length

  return (
    <nav className="flex h-14 w-full items-center border-b border-neutral-600">
      <ViewTopButton
        onClick={() =>
          dispatch({
            t: "clicked-link",
            route: { t: "spaces", c: { t: "space-list" } },
          })
        }
        label="Home"
        icon={<IconHome className="h-6 w-6" />}
      />

      <ViewTopButton
        onClick={() => dispatch({ t: "clicked-people-button" })}
        label={peopleCount > 1 ? `People (${peopleCount})` : `People`}
        icon={<IconUserGroup className="h-6 w-6" />}
      />

      <div className="flex-1"></div>

      {space.hostId !== ctx.currentUserId && (
        <div className="p-2">
          <LeaveSpaceClient.ViewLeaveSpaceButton {...input} />
        </div>
      )}

      {space.hostId === ctx.currentUserId && (
        <div className="p-2">
          <EndSpaceClient.ViewEndSpaceButton {...input} />
        </div>
      )}
    </nav>
  )
}

const ViewTopButton = ({
  icon,
  label,
  onClick,
}: {
  icon: VDom
  label: string
  onClick: () => void
}) => {
  return (
    <button className="grid w-20 place-items-center py-1" onClick={onClick}>
      {icon}
      <p className="text-xs">{label}</p>
    </button>
  )
}

const ViewSpaceNotFound = ({
  dispatch,
}: {
  dispatch: (m: MsgClient) => void
}) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">Space not found</p>
      <Button
        onClick={() =>
          dispatch({
            t: "clicked-link",
            route: { t: "spaces", c: { t: "space-list" } },
          })
        }
        size="lg"
        variant="contained"
        color="primary"
        start={<IconHome className="h-6 w-6" />}
        text="Go Home"
      />
    </div>
  )
}

const ViewSpaceEnded = ({ dispatch }: { dispatch: (m: MsgClient) => void }) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">Space ended</p>
      <Button
        onClick={() =>
          dispatch({
            t: "clicked-link",
            route: { t: "spaces", c: { t: "space-list" } },
          })
        }
        size="lg"
        variant="contained"
        color="primary"
        start={<IconHome className="h-6 w-6" />}
        text="Go Home"
      />
    </div>
  )
}

export const ViewCurrentSpaceBar = ({
  ctx,
  model,
  dispatch,
}: {
  ctx: ClientCtx
  model: ModelClient
  dispatch: (msg: MsgClient) => void
}) => {
  const dispatchEvent = (msg: SpaceEvent) =>
    dispatch({ t: "event", c: withId(msg) })

  const userSpaceId = model.spaceIdByUserId[ctx.currentUserId]

  if (!userSpaceId) {
    return null
  }

  const space = Spaces.toSpaceStarted(model, userSpaceId)

  if (!space) {
    return null
  }

  const hostProfile = ctx.profiles[space.hostId]

  const userCount = Object.values(space.users).length

  return (
    <div className="flex w-full items-center overflow-hidden border-t-2 border-blue-600 text-inherit">
      <button
        className="flex flex-1 items-center overflow-hidden"
        onClick={() => {
          dispatch({
            t: "clicked-link",
            route: {
              t: "spaces",
              c: { t: "space", spaceId: space.spaceId },
            },
          })
        }}
      >
        <div className="mr-2 p-2">
          {!space.game ? (
            <Avatar
              src={hostProfile?.avatarUrl}
              alt="Host Avatar"
              className="h-12 w-12"
            />
          ) : (
            <div className="h-12 w-12 overflow-hidden rounded border border-neutral-600">
              <CoverArt gameName={space.game.t} />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 overflow-hidden">
          <p className="text-left">
            {hostProfile ? `${hostProfile.username}'s space` : "..."}
          </p>
          <p className="text-left text-xs text-neutral-300">
            {userCount} in space
          </p>
        </div>
      </button>

      {ctx.currentUserId === space.hostId && (
        <button
          aria-label="end space"
          onClick={() => {
            dispatchEvent({
              t: "user-ended-space",
              userId: ctx.currentUserId,
              spaceId: space.spaceId,
            })
          }}
          className="mr-4"
        >
          <IconXMark className="h-8 w-8" />
        </button>
      )}

      {ctx.currentUserId !== space.hostId && (
        <button
          aria-label="leave space"
          onClick={() => {
            dispatchEvent({
              t: "user-left-space",
              userId: ctx.currentUserId,
              spaceId: space.spaceId,
            })
          }}
          className="mr-4"
        >
          <IconXMark className="h-8 w-8" />
        </button>
      )}
    </div>
  )
}
