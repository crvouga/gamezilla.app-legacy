import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { ClientCtx } from "gamezilla/@CHILD/app/@SHARED/client"
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data"
import {
  Button,
  IconHome,
  IconUserGroup,
} from "gamezilla/@CHILD/app/@SHARED/ui"
import { SpaceClientModule } from "../architechure/space-client"
import { EndSpaceClient } from "../end-space/end-space.client"
import { Feed } from "../feed/feed"
import { GameClient } from "../game/game.client"
import { JoinSpaceClient } from "../join-space/join-space.client"
import { LeaveSpaceClient } from "../leave-space/leave-space.client"
import { Modals } from "../modals/modals"
import { Spaces } from "../spaces-core"
import { ModelClient, MsgClient } from "../spaces.core"
import { VDom } from "gamezilla/@SHARED/vdom"

const View = (input: {
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
        return (
          <>
            <JoinSpaceClient.View {...input} ctx={spaceCtx} />
            <Modals.View {...input} ctx={spaceCtx} />
          </>
        )
      }

      return (
        <div className="flex h-full w-full flex-1 flex-col">
          <Modals.View {...input} ctx={spaceCtx} />

          <ViewTopBar {...input} ctx={spaceCtx} />

          <Feed.View
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
        onClick={() => dispatch({ t: "clicked-go-home-button" })}
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
        onClick={() => dispatch({ t: "clicked-go-home-button" })}
        size="lg"
        variant="contained"
        color="primary"
        start={<IconHome className="h-6 w-6" />}
        text="Go Home"
      />
    </div>
  )
}

export const SpaceClient = {
  View,
}
