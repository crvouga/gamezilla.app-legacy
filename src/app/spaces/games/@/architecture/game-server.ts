import { Eff } from '~/@/program/eff'
import { Sub } from '~/@/program/sub'
import type { EventMeta, WithEventId, WithEventMeta } from '~/@/event-sourced/event'
import { SpaceServerCmd } from '~/app/spaces/@/space-server-cmd'
import { SpaceServerCtx } from '~/app/spaces/@/space-server-ctx'
import { SpaceServerEvt } from '~/app/spaces/@/space-server-evt'

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
  ModelCore: any
  MsgCore: any
  //
}

type Output<T extends GameServerTypes> = {
  model: T['ModelServer']
  msgCore?: WithEventId<T['MsgCore']>[]
  eff?: Eff<T['MsgServer']>
  msgCmd?: SpaceServerCmd<T['MsgToClient']>[]
}

export type GameServer<T extends GameServerTypes> = {
  init: (input: { ctx: SpaceServerCtx; state: T['ModelCore']; model?: T['ModelServer'] | null }) => Promise<{
    model: T['ModelServer']
    eff?: Eff<T['MsgServer']>
    msgCmd?: SpaceServerCmd<T['MsgToClient']>[]
  }>

  update: (input: {
    ctx: SpaceServerCtx
    state: T['ModelCore']
    model?: T['ModelServer'] | null
    //
    msg?: T['MsgServer'] | null
    clientMsg?: T['MsgToServer'] | null
    msgCore?: WithEventMeta<T['MsgCore']> | null
    msgEvt?: SpaceServerEvt | null
  }) => Promise<Output<T>>

  subscriptions: (input: {
    model?: T['ModelServer'] | null
    intervalId: string
    ctx: SpaceServerCtx
    state: T['ModelCore']
  }) => Promise<Sub<T['MsgServer']>>
}

/**
 * Tags all the messages and models that are inputted and outputted from this module.
 */
const tag = <T extends string, Types extends GameServerTypes>(
  tag: T,
  server: GameServer<Types>
): GameServer<{
  ModelServer: { t: T; c: Types['ModelServer'] }
  MsgServer: { t: T; c: Types['MsgServer'] }
  MsgToClient: { t: T; c: Types['MsgToClient'] }
  MsgToServer: { t: T; c: Types['MsgToServer'] }
  ModelCore: { t: T; c: Types['ModelCore'] }
  MsgCore: { t: T; c: Types['MsgCore'] & EventMeta }
}> => {
  return {
    init: async (input) => {
      const initial = await server.init({
        ctx: input.ctx,
        state: input.state.c
      })
      return {
        model: {
          t: tag,
          c: initial.model
        },
        eff: Eff.tag(tag, initial.eff),
        msgCmd: SpaceServerCmd.tag(tag, initial.msgCmd)
      }
    },

    update: async (input) => {
      const updated = await server.update({
        msgEvt: input.msgEvt,
        msg: input.msg?.t === tag ? input.msg?.c : undefined,
        model: input.model?.t === tag ? input.model?.c : undefined,
        msgCore: input.msgCore?.t === tag ? input.msgCore?.c : undefined,
        clientMsg: input.clientMsg?.t === tag ? input.clientMsg?.c : undefined,
        ctx: input.ctx,
        state: input.state.c
      })
      return {
        model: {
          t: tag,
          c: updated.model
        },
        eff: Eff.tag(tag, updated.eff),
        msgCmd: SpaceServerCmd.tag(tag, updated.msgCmd),
        msgCore: updated.msgCore
          ? updated.msgCore.map(
              (
                msgCore
              ): EventMeta & {
                t: T
                c: Types['MsgCore']
              } => ({
                eventId: msgCore.msgEvtId,
                happenedAt: msgCore.happenedAt,
                t: tag,
                c: msgCore
              })
            )
          : undefined
      }
    },
    subscriptions: async (input) => {
      return Sub.tag(
        tag,
        await server.subscriptions({
          ctx: input.ctx,
          intervalId: input.intervalId,
          model: input.model?.c,
          state: input.state.c
        })
      )
    }
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
  ...updaters: ((input: T['ModelServer']) => Promise<Output<T>>)[]
): Promise<Output<T>> => {
  const msgCmd: SpaceServerCmd<T['MsgToClient']>[] = (await initial).msgCmd ?? []
  const msgCores: (T['MsgCore'] & EventMeta)[] = (await initial)?.msgCore ?? []
  const eff: Eff<T['MsgServer']>[] = (await initial).eff ? [(await initial).eff!] : []

  let model = (await initial).model
  let i = 0
  const len = updaters.length

  for (i = 0; i < len; ++i) {
    const updated = await updaters[i]!(model)

    model = updated.model

    if (updated.eff) {
      eff.push(updated.eff)
    }
    if (updated.msgCore) {
      let j = 0
      const len = updated.msgCore.length
      for (j = 0; j < len; ++j) {
        msgCores.push(updated.msgCore[j]!)
      }
    }
    if (updated.msgCmd) {
      let j = 0
      const len = updated.msgCmd.length
      for (j = 0; j < len; ++j) {
        msgCmd.push(updated.msgCmd[j]!)
      }
    }
  }

  return {
    model,
    eff: Eff.batch(eff),
    msgCore: msgCores,
    msgCmd
  }
}

export const GameServer = {
  tag,
  chain
}
