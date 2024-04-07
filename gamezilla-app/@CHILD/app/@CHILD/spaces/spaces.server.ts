import { SpaceServerCmd } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/space-server-cmd"
import { Eff, batchMsgs } from "gamezilla-app/@SHARED/core"
import { Input, Output, SpaceServerModule } from "./architecture/space-server"
import { GameServer } from "./game/game.server"
import { JoinSpaceServer } from "./join-space/join-space.server"
import { ListSpacesServer } from "./list-spaces/list-spaces.server"
import { ProfileCache } from "./profile-cache"
import * as Spaces from "./spaces-core/spaces-core.client"
import { ServerModule } from "./spaces.core"
import { StartSpaceServer } from "./start-space/start-space.server"
import { SyncServer } from "./sync/sync.server"

//
//
//
// Init
//
//
//

export const getDeps: ServerModule["getDeps"] = ({ ctx }) => {
  return {
    ProfileCache: ProfileCache({
      t: "db-kv",
      dbConnKv: ctx.dbConnKv,
    }),
  }
}

//
//
//
// Model
//
//
//

export const init: ServerModule["init"] = async () => {
  return {
    model: {
      ...Spaces.init,
      games: {},
      profileCache: {},
    },
  }
}

//
//
//
// Update
//
//
//

export const update: ServerModule["update"] = async (input) => {
  const updated = await updateMain(input)

  return {
    model: updated.model,
    eff: updated.eff,
    msgCmd: SpaceServerCmd.toServerCmd(updated.msgCmd),
  }
}

const updateMain = async (input: Input, acc?: Output): Promise<Output> => {
  acc = acc ?? (await updateChild(input))

  const [spaceEvent, ...spaceEventsRest] = acc.msgSpaceEvent ?? []

  if (spaceEvent) {
    const updated = await updateChild({
      deps: input.deps,
      ctx: input.ctx,
      model: acc.model,
      msgSpaceEvent: spaceEvent,
    })

    return updateMain(input, {
      model: updated.model,
      eff: Eff.batch([acc.eff, updated.eff]),
      msgSpaceEvent: batchMsgs(spaceEventsRest, updated.msgSpaceEvent),
      msgCmd: batchMsgs(acc.msgCmd, updated.msgCmd),
      msgEvt: updated.msgEvt,
    })
  }

  const [spaceCmd, ...spaceCmdsRest] = SpaceServerCmd.toSpaceServerCmd(
    acc.msgCmd,
  )

  if (spaceCmd) {
    const updated = await updateChild({
      deps: input.deps,
      ctx: input.ctx,
      model: acc.model,
      msgCmd: spaceCmd,
    })

    return updateMain(input, {
      model: updated.model,
      eff: Eff.batch([acc.eff, updated.eff]),
      msgSpaceEvent: batchMsgs(acc.msgSpaceEvent, updated.msgSpaceEvent),
      msgCmd: batchMsgs(spaceCmdsRest, updated.msgCmd),
      msgEvt: updated.msgEvt,
    })
  }

  return acc
}

const updateChild: SpaceServerModule["update"] = async (input) => {
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

  return SpaceServerModule.andThen(
    { model: input.model },
    //
    (model) => updateSpacesFromSpaceEvent({ ...input, model }),
    (model) => ListSpacesServer.update({ ...input, model }),
    (model) => SyncServer.update({ ...input, model }),
    (model) => StartSpaceServer.update({ ...input, model }),
    (model) => JoinSpaceServer.update({ ...input, model }),
    (model) => GameServer.update({ ...input, model }),
  )
}

const updateSpacesFromSpaceEvent: SpaceServerModule["update"] = ({
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
// Subscriptions
//
//
//

export const subscriptions: ServerModule["subscriptions"] = async (input) => {
  return GameServer.subscriptions(input)
}
