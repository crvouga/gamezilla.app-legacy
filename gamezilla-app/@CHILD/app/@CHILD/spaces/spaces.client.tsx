import { isAnonymous } from "gamezilla-app/@CHILD/app/@SHARED/client"

import { Eff, Sub, batchMsgs, notAsked } from "gamezilla-app/@SHARED/core"
import { VDom } from "gamezilla-app/@SHARED/vdom"
import { SpaceClientCmd } from "./@SHARED/space-client-cmd"
import { SpacesRoutes } from "./@SHARED/space-routes"
import { Input, Output, SpaceClientModule } from "./architecture/architecture"
import { CurrentSpaceBottomBar } from "./current-space-bottom-bar/current-space-bottom-bar"
import { EndSpaceClient } from "./end-space/end-space.client"
import { GameClient } from "./game/game.client"
import { GoHome } from "./go-home/go-home"
import { JoinSpaceClient } from "./join-space/join-space.client"
import { LeaveSpaceClient } from "./leave-space/leave-space.client"
import { ListSpacesClient } from "./list-spaces/list-spaces.client"
import { Modals } from "./modals/modals"
import { SpaceClient } from "./space/space.cient"
import { Spaces } from "./spaces-core"
import { ClientModule, ModelClient } from "./spaces.core"
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
      modelLocation: input.modelLocation,
    })

    return updateMain(input, {
      model: updated.model,
      modelLocation: updated.modelLocation ?? acc.modelLocation,
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

  return SpaceClientModule.andThen(
    { model: input.model },
    (model) => EndSpaceClient.update({ ...input, model }),
    (model) => Modals.update({ ...input, model }),
    (model) => LeaveSpaceClient.update({ ...input, model }),
    (model) => updateSpacesFromSpaceEvent({ ...input, model }),
    (model) => GameClient.update({ ...input, model }),
    (model) => SyncClient.update({ ...input, model }),
    (model) => StartSpaceClient.update({ ...input, model }),
    (model) => JoinSpaceClient.update({ ...input, model }),
    (model) => ListSpacesClient.update({ ...input, model }),
    (model) => GoHome.update({ ...input, model }),
    (model) => CurrentSpaceBottomBar.update({ ...input, model }),
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

export const subscriptions: ClientModule["subscriptions"] = async (input) => {
  return Sub.batch([
    //
    await GameClient.subscriptions(input),
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

export const View: ClientModule["View"] = ({
  ctx,
  dispatch,
  model,
  slots,
}): VDom => {
  if (isAnonymous(ctx)) {
    return null
  }

  if (SpacesRoutes.SpaceList.is(ctx.currentRouteV2)) {
    return (
      <>
        <ListSpacesClient.View dispatch={dispatch} ctx={ctx} model={model} />

        {slots?.bottomBar(null)}
      </>
    )
  }

  if (SpacesRoutes.Space.is(ctx.currentRouteV2)) {
    return (
      <SpaceClient.View
        spaceId={ctx.currentRouteV2.payload.spaceId}
        ctx={ctx}
        dispatch={dispatch}
        model={model}
      />
    )
  }

  return null
}

export const ViewCurrentSpaceBar = CurrentSpaceBottomBar.View
