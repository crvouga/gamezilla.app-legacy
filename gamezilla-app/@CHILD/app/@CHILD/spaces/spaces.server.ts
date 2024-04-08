import { SpaceServerCmd } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/space-server-cmd"
import { Eff, batchMsgs } from "gamezilla-app/@SHARED/core"
import { Input, Output, SpaceServerModule } from "./architecture/space-server"
import { GameServer } from "./game/game.server"
import { JoinSpaceServer } from "./join-space/join-space.server"
import { ListSpacesServer } from "./list-spaces/list-spaces.server"
import { ProfileCache } from "./profile-cache"
import { SpacesDb } from "./spaces-core/space-db"
import { SpacesCoreServer } from "./spaces-core/spaces-core.server"
import { ServerModule } from "./spaces.core"
import { StartSpaceServer } from "./start-space/start-space.server"
import { SyncServer } from "./sync/sync.server"
import { GameDb } from "./game/game-db"

//
//
//
// Init
//
//
//

export const getDeps: ServerModule["getDeps"] = async ({ ctx }) => {
  return {
    ProfileCache: ProfileCache({
      t: "db-conn-kv",
      dbConnKv: ctx.dbConnKv,
    }),
    SpacesDb: SpacesDb({
      t: "db-conn-kv",
      dbConnKv: ctx.dbConnKv,
    }),
    GameDb: GameDb({
      t: "db-conn-kv",
      dbConnKv: ctx.dbConnKv,
    }),
  }
}

export type Deps = Awaited<ReturnType<typeof getDeps>>

//
//
//
// Model
//
//
//

export const init: ServerModule["init"] = async () => {
  return {
    model: null,
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
    (await SpacesCoreServer.hasEvent(
      input.deps.SpacesDb,
      input.msgSpaceEvent.spaceId,
      input.msgSpaceEvent.eventId,
    ))
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

const updateSpacesFromSpaceEvent: SpaceServerModule["update"] = async ({
  msgSpaceEvent,
  model,
  deps,
}) => {
  if (!msgSpaceEvent) {
    return { model }
  }

  await SpacesCoreServer.update({
    spacesDb: deps.SpacesDb,
    spaceEvent: msgSpaceEvent,
  })

  return { model }
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
