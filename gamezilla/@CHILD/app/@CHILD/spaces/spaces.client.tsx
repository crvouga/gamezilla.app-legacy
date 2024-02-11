import { WithEventId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { FeedItem } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/feed-item"
import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { ClientCtx } from "gamezilla/@CHILD/app/@SHARED/client"
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data"
import {
  Avatar,
  Button,
  IconHome,
  IconUserGroup,
  IconXMark,
  VDom,
} from "gamezilla/@CHILD/app/@SHARED/ui"
import { Eff, Sub, batchMsgs, notAsked } from "gamezilla/@SHARED/core"
import { CoverArt } from "./@CHILD/game/game-cover-art"
import { Game } from "./@CHILD/game/game.client"
import { SpaceClientCmd } from "./@SHARED/space-client-cmd"
import { Input, Output, SpaceClientModule } from "./architechure/space-client"
import { EndSpaceClient } from "./end-space/end-space.client"
import { GameClient } from "./game/game.client"
import { JoinSpaceClient } from "./join-space/join-space.client"
import { LeaveSpaceClient } from "./leave-space/leave-space.client"
import { ListSpacesClient } from "./list-spaces/list-spaces.client"
import { Modals } from "./modals/modals"
import { SpaceEvent, SpaceState, Spaces } from "./spaces-core"
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
    msgCmd: SpaceClientCmd.toClientCmd(batchMsgs(listSpaces.msgCmd)),
  }
}

//
//
//
// Update
//
//
//

export const update: ClientModule["update"] = async (input) => {
  const updated = await updateMain(input)

  return {
    model: updated.model,
    eff: updated.eff,
    msgCmd: SpaceClientCmd.toClientCmd(updated.msgCmd),
  }
}

export const updateMain = async (
  input: Input,
  acc?: Output,
): Promise<Output> => {
  acc = acc ?? (await updateChild(input))

  const [spaceEvent, ...spaceEventsRest] = acc.msgSpaceEvent ?? []

  if (spaceEvent) {
    const updated = await updateChild({
      ctx: input.ctx,
      model: acc.model,
      msgSpaceEvent: spaceEvent,
    })

    return updateMain(input, {
      model: updated.model,
      eff: Eff.batch([acc.eff, updated.eff]),
      msgSpaceEvent: batchMsgs(spaceEventsRest, updated.msgSpaceEvent),
      msgCmd: batchMsgs(acc.msgCmd, updated.msgCmd),
      msgEvt: [],
    })
  }

  const [spaceCmd, ...spaceCmdsRest] = SpaceClientCmd.toSpaceClientCmd(
    acc.msgCmd,
  )

  if (spaceCmd) {
    const updated = await updateChild({
      ctx: input.ctx,
      model: acc.model,
      msgCmd: spaceCmd,
    })

    return updateMain(input, {
      model: updated.model,
      eff: Eff.batch([acc.eff, updated.eff]),
      msgSpaceEvent: batchMsgs(acc.msgSpaceEvent, updated.msgSpaceEvent),
      msgCmd: batchMsgs(spaceCmdsRest, updated.msgCmd),
      msgEvt: [],
    })
  }

  return acc
}

const updateChild: SpaceClientModule["update"] = (input) => {
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
    (model) => EndSpaceClient.update({ ...input, model }),
    (model) => Modals.update({ ...input, model }),
    (model) => LeaveSpaceClient.update({ ...input, model }),
    (model) => updateSpacesFromSpaceEvent({ ...input, model }),
    (model) => SyncClient.update({ ...input, model }),
    (model) => GameClient.update({ ...input, model }),
    (model) => StartSpaceClient.update({ ...input, model }),
    (model) => JoinSpaceClient.update({ ...input, model }),
    (model) => ListSpacesClient.update({ ...input, model }),
  )
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

const ViewSpaceScreen = (input: {
  model: ModelClient
  ctx: ClientCtx
  dispatch: (m: MsgClient) => void
  spaceId: SpaceId
}) => {
  const { model, ctx, dispatch } = input
  const spaceState = Spaces.toSpaceState(input.model, input.spaceId)

  switch (spaceState.type) {
    case "initial": {
      return <ViewSpaceNotFound {...input} />
    }

    case "ended": {
      return <EndSpaceClient.ViewSpaceEnded {...input} />
    }

    case "started": {
      const spaceCtx: SpaceClientCtx = {
        ...ctx,
        currentUserId: ctx.currentUserId,
        space: spaceState,
      }

      const currentUserSpaceId = Spaces.toSpaceIdByUserId(
        input.model,
        input.ctx.currentUserId,
      )

      if (currentUserSpaceId !== spaceCtx.space.spaceId) {
        return <JoinSpaceClient.View {...input} ctx={spaceCtx} />
      }

      return (
        <div className="flex h-full w-full flex-1 flex-col">
          <Modals.View ctx={spaceCtx} dispatch={dispatch} model={model} />

          <ViewTopBar {...input} ctx={spaceCtx} />

          <ViewFeed
            spaceState={spaceState}
            ctx={spaceCtx}
            model={model}
            dispatch={dispatch}
          />

          <div className="flex w-full flex-1 flex-col overflow-hidden">
            <GameClient.View {...input} ctx={spaceCtx} />
          </div>
        </div>
      )
    }
  }
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
      <ViewTopBarButton
        onClick={() =>
          dispatch({
            t: "clicked-link",
            route: { t: "spaces", c: { t: "space-list" } },
          })
        }
        label="Home"
        icon={<IconHome className="h-6 w-6" />}
      />

      <ViewTopBarButton
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

const ViewTopBarButton = ({
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

export const ViewCurrentSpaceBar = ({
  ctx,
  model,
  dispatch,
}: {
  ctx: ClientCtx
  model: ModelClient
  dispatch: (msg: MsgClient) => void
}) => {
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
          onClick={() => dispatch({ t: "clicked-end-space-button" })}
          className="mr-4"
        >
          <IconXMark className="h-8 w-8" />
        </button>
      )}

      {ctx.currentUserId !== space.hostId && (
        <button
          aria-label="leave space"
          onClick={() => dispatch({ t: "clicked-leave-space-button" })}
          className="mr-4"
        >
          <IconXMark className="h-8 w-8" />
        </button>
      )}
    </div>
  )
}
