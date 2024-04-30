import { Eff, Sub } from "gamezilla-app/@shared/core"
import { SpaceReqCtx, SpaceServerCtx, SpaceServerEvent } from "../space"
import { SpaceServerCmd } from "../space-server-cmd"
import {
  EventMeta,
  WithEventId,
  WithEventMeta,
} from "gamezilla-app/app/spaces/@shared/event"

//
//
//
//
//
//
//

export type GameServerTypes = {
  //
  ModelServer: any
  MsgServer: any
  MsgToClient: any
  MsgToServer: any
  //
  ModelSync: any
  MsgSync: any
  //
}

type Output<T extends GameServerTypes> = {
  model: T["ModelServer"]
  msgSync?: WithEventId<T["MsgSync"]>[]
  eff?: Eff<T["MsgServer"]>
  msgCmd?: SpaceServerCmd<T["MsgToClient"]>[]
}

export type GameServer<T extends GameServerTypes> = {
  init: (input: {
    ctx: SpaceServerCtx
    state: T["ModelSync"]
    model?: T["ModelServer"] | null
  }) => Promise<{
    model: T["ModelServer"]
    eff?: Eff<T["MsgServer"]>
    msgCmd?: SpaceServerCmd<T["MsgToClient"]>[]
  }>

  update: (input: {
    ctx: SpaceServerCtx | SpaceReqCtx
    state: T["ModelSync"]
    model?: T["ModelServer"] | null
    //
    msg?: T["MsgServer"] | null
    clientMsg?: T["MsgToServer"] | null
    msgSync?: WithEventMeta<T["MsgSync"]> | null
    msgEvt?: SpaceServerEvent | null
  }) => Promise<Output<T>>

  subscriptions: (input: {
    model?: T["ModelServer"] | null
    intervalId: string
    ctx: SpaceServerCtx
    state: T["ModelSync"]
  }) => Promise<Sub<T["MsgServer"]>>
}

/**
 * Tags all the messages and models that are inputted and outputted from this module.
 */
const tag = <T extends string, Types extends GameServerTypes>(
  tag: T,
  server: GameServer<Types>,
): GameServer<{
  ModelServer: { t: T; c: Types["ModelServer"] }
  MsgServer: { t: T; c: Types["MsgServer"] }
  MsgToClient: { t: T; c: Types["MsgToClient"] }
  MsgToServer: { t: T; c: Types["MsgToServer"] }
  ModelSync: { t: T; c: Types["ModelSync"] }
  MsgSync: { t: T; c: Types["MsgSync"] & EventMeta }
}> => {
  return {
    init: async (input) => {
      const initial = await server.init({
        ctx: input.ctx,
        state: input.state.c,
      })
      return {
        model: { t: tag, c: initial.model },
        eff: Eff.tag(tag, initial.eff),
        msgCmd: SpaceServerCmd.tag(tag, initial.msgCmd),
      }
    },

    update: async (input) => {
      const updated = await server.update({
        msgEvt: input.msgEvt,
        msg: input.msg?.t === tag ? input.msg?.c : undefined,
        model: input.model?.t === tag ? input.model?.c : undefined,
        msgSync: input.msgSync?.t === tag ? input.msgSync?.c : undefined,
        clientMsg: input.clientMsg?.t === tag ? input.clientMsg?.c : undefined,
        ctx: input.ctx,
        state: input.state.c,
      })
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.tag(tag, updated.eff),
        msgCmd: SpaceServerCmd.tag(tag, updated.msgCmd),
        msgSync: updated.msgSync
          ? updated.msgSync.map(
              (msgSync): EventMeta & { t: T; c: Types["MsgSync"] } => ({
                eventId: msgSync.msgEvtId,
                happenedAt: msgSync.happenedAt,
                t: tag,
                c: msgSync,
              }),
            )
          : undefined,
      }
    },
    subscriptions: async (input) => {
      return Sub.tag(
        tag,
        await server.subscriptions({
          ctx: input.ctx,
          intervalId: input.intervalId,
          model: input.model?.c,
          state: input.state.c,
        }),
      )
    },
  }
}

/**
 * @description
 * A helper function used for chaining together update functions together.
 * @example
 * const updated = chain(
 * { model: 0 },
 * (model) => ({ model: model + 1, msgEvt: [someEvent] }),
 * (model) => ({ model: model + 1, eff: someEff }),
 * (model) => ({ model: model + 1, msgCmd: [someCmd] }),
 * )
 * //=> { model: 3, msgEvt: [someEvent], eff: someEff, msgCmd: [someCmd] }
 *
 * @param initial - the model to start with
 * @param updaters - a list of update functions to apply to the model
 * @returns Accumulated output from all the update functions
 */
const chain = async <T extends GameServerTypes>(
  initial: Output<T> | Promise<Output<T>>,
  ...updaters: ((input: T["ModelServer"]) => Promise<Output<T>>)[]
): Promise<Output<T>> => {
  const msgCmd: SpaceServerCmd<T["MsgToClient"]>[] =
    (await initial).msgCmd ?? []
  const msgSyncs: (T["MsgSync"] & EventMeta)[] = (await initial)?.msgSync ?? []
  const eff: Eff<T["MsgServer"]>[] = (await initial).eff
    ? [(await initial).eff!]
    : []

  let model = (await initial).model
  let i = 0
  let len = updaters.length

  for (i = 0; i < len; ++i) {
    const updated = await updaters[i]!(model)

    model = updated.model

    if (updated.eff) {
      eff.push(updated.eff)
    }
    if (updated.msgSync) {
      let j = 0
      let len = updated.msgSync.length
      for (j = 0; j < len; ++j) {
        msgSyncs.push(updated.msgSync[j]!)
      }
    }
    if (updated.msgCmd) {
      let j = 0
      let len = updated.msgCmd.length
      for (j = 0; j < len; ++j) {
        msgCmd.push(updated.msgCmd[j]!)
      }
    }
  }

  return {
    model,
    eff: Eff.batch(eff),
    msgSync: msgSyncs,
    msgCmd,
  }
}

export const GameServer = {
  tag,
  chain,
}
