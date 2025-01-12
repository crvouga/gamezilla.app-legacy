import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import type { EventMeta, WithEventId, WithEventMeta } from '~/@/event-sourced/event'
import { SpaceBackendCmd } from '~/app/spaces/@/space-backend/cmd'
import { SpaceBackendCtx } from '~/app/spaces/@/space-backend/ctx'
import { SpaceBackendEvt } from '~/app/spaces/@/space-backend/evt'

//
//
//
//
//
//
//

export type GameBackendTypes = {
  //
  ModelBackend: any
  MsgBackend: any
  MsgToClient: any
  MsgToBackend: any
  //
  ModelCore: any
  MsgCore: any
  //
}

type Output<T extends GameBackendTypes> = {
  model: T['ModelBackend']
  msgCore?: WithEventId<T['MsgCore']>[]
  eff?: Eff<T['MsgBackend']>
  msgCmd?: SpaceBackendCmd<T['MsgToClient']>[]
}

export type GameBackend<T extends GameBackendTypes> = {
  init: (input: { ctx: SpaceBackendCtx; state: T['ModelCore']; model?: T['ModelBackend'] | null }) => Promise<{
    model: T['ModelBackend']
    eff?: Eff<T['MsgBackend']>
    msgCmd?: SpaceBackendCmd<T['MsgToClient']>[]
  }>

  update: (input: {
    ctx: SpaceBackendCtx
    state: T['ModelCore']
    model?: T['ModelBackend'] | null
    //
    msg?: T['MsgBackend'] | null
    clientMsg?: T['MsgToBackend'] | null
    msgCore?: WithEventMeta<T['MsgCore']> | null
    msgEvt?: SpaceBackendEvt | null
  }) => Promise<Output<T>>

  subscriptions: (input: {
    model?: T['ModelBackend'] | null
    intervalId: string
    ctx: SpaceBackendCtx
    state: T['ModelCore']
  }) => Promise<Sub<T['MsgBackend']>>
}

/**
 * Tags all the messages and models that are inputted and outputted from this module.
 */
const tag = <T extends string, Types extends GameBackendTypes>(
  tag: T,
  backend: GameBackend<Types>,
): GameBackend<{
  ModelBackend: { t: T; c: Types['ModelBackend'] }
  MsgBackend: { t: T; c: Types['MsgBackend'] }
  MsgToClient: { t: T; c: Types['MsgToClient'] }
  MsgToBackend: { t: T; c: Types['MsgToBackend'] }
  ModelCore: { t: T; c: Types['ModelCore'] }
  MsgCore: { t: T; c: Types['MsgCore'] & EventMeta }
}> => {
  return {
    init: async (input) => {
      const initial = await backend.init({
        ctx: input.ctx,
        state: input.state.c,
      })
      return {
        model: {
          t: tag,
          c: initial.model,
        },
        eff: Eff.tag(tag, initial.eff),
        msgCmd: SpaceBackendCmd.tag(tag, initial.msgCmd),
      }
    },

    update: async (input) => {
      const updated = await backend.update({
        msgEvt: input.msgEvt,
        msg: input.msg?.t === tag ? input.msg?.c : undefined,
        model: input.model?.t === tag ? input.model?.c : undefined,
        msgCore: input.msgCore?.t === tag ? input.msgCore?.c : undefined,
        clientMsg: input.clientMsg?.t === tag ? input.clientMsg?.c : undefined,
        ctx: input.ctx,
        state: input.state.c,
      })
      return {
        model: {
          t: tag,
          c: updated.model,
        },
        eff: Eff.tag(tag, updated.eff),
        msgCmd: SpaceBackendCmd.tag(tag, updated.msgCmd),
        msgCore: updated.msgCore
          ? updated.msgCore.map(
              (
                msgCore,
              ): EventMeta & {
                t: T
                c: Types['MsgCore']
              } => ({
                eventId: msgCore.msgEvtId,
                happenedAt: msgCore.happenedAt,
                t: tag,
                c: msgCore,
              }),
            )
          : undefined,
      }
    },
    subscriptions: async (input) => {
      return Sub.tag(
        tag,
        await backend.subscriptions({
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
const chain = async <T extends GameBackendTypes>(
  initial: Output<T> | Promise<Output<T>>,
  ...updaters: ((input: T['ModelBackend']) => Promise<Output<T>>)[]
): Promise<Output<T>> => {
  const msgCmd: SpaceBackendCmd<T['MsgToClient']>[] = (await initial).msgCmd ?? []
  const msgCores: (T['MsgCore'] & EventMeta)[] = (await initial)?.msgCore ?? []
  const eff: Eff<T['MsgBackend']>[] = (await initial).eff ? [(await initial).eff!] : []

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
    msgCmd,
  }
}

export const GameBackend = {
  tag,
  chain,
}
