import type { WithEventId, WithEventMeta } from '@/event-sourced/event'
import { AppClientCmd, type ClientEvt } from 'app/@/client'
import { Eff, Sub } from '@/core'
import type { VDom } from '@/vdom'

export type GameClientTypes = {
  //
  ModelClient: any
  MsgClient: any
  //
  MsgToClient: any
  MsgToServer: any
  //
  ModelCore: any
  MsgCore: any
  //
  ClientCtx: any
}

type Output<T extends GameClientTypes> = {
  model: T['ModelClient']
  eff?: Eff<T['MsgClient']>
  msgCmd?: AppClientCmd<{
    MsgClient: T['MsgClient']
    MsgToServer: T['MsgToServer']
  }>[]
  msgCore?: WithEventId<T['MsgCore']>[]
}

export type InMsg<T extends GameClientTypes> =
  | ({ variant: 'msg' } & T['MsgClient'])
  | ({ variant: 'to-client' } & T['MsgToClient'])
  | ({ variant: 'event' } & ClientEvt)

export type OutMsg<T extends GameClientTypes> =
  | ({ variant: 'msgCmd' } & AppClientCmd<T>)
  | ({ variant: 'game-event' } & WithEventId<T['MsgCore']>)

export type GameClient<T extends GameClientTypes> = {
  init: (input: { ctx: T['ClientCtx']; modelCore: T['ModelCore']; model?: T['ModelClient'] | null }) => Output<T>

  update: (input: {
    ctx: T['ClientCtx']
    modelCore: T['ModelCore']
    modelCoreBefore: T['ModelCore']
    model?: T['ModelClient'] | null
    //
    msg?: T['MsgClient'] | null
    msgServer?: T['MsgToClient'] | null
    msgEvt?: ClientEvt | null
    msgCore?: WithEventMeta<T['MsgCore']> | null
  }) => Output<T>

  subscriptions: (input: {
    intervalId: string
    ctx: T['ClientCtx']
    model?: T['ModelClient'] | null
    modelCore: T['ModelCore']
  }) => Sub<T['MsgClient']>

  View: (input: {
    ctx: T['ClientCtx']
    dispatch: (msg: T['MsgClient']) => void
    modelCore: T['ModelCore']
    model?: T['ModelClient'] | null
  }) => VDom

  ViewFeedItem: (input: { ctx: T['ClientCtx']; modelCore: T['ModelCore']; msgEvt: T['MsgCore'] }) => VDom
}

/**
 * Tags all the messages and models that are inputted and outputted from this module.
 */
export const tag = <T extends string, Types extends GameClientTypes>(
  tag: T,
  client: GameClient<Types>
): GameClient<{
  ModelClient: { t: T; c: Types['ModelClient'] }
  MsgClient: { t: T; c: Types['MsgClient'] }
  MsgToClient: { t: T; c: Types['MsgToClient'] }
  MsgToServer: { t: T; c: Types['MsgToServer'] }
  ModelCore: { t: T; c: Types['ModelCore'] }
  MsgCore: { t: T; c: Types['MsgCore'] }
  ClientCtx: Types['ClientCtx']
}> => {
  return {
    init: (input) => {
      const initial = client.init({
        ctx: input.ctx,
        modelCore: input.modelCore.c,
        model: input.model?.c
      })
      return {
        model: {
          t: tag,
          c: initial.model
        },
        eff: Eff.tag(tag, initial.eff),
        msgCmd: AppClientCmd.tag(tag, initial.msgCmd)
      }
    },

    update: (input) => {
      const updated = client.update({
        msgEvt: input.msgEvt,
        msg: input.msg?.t === tag ? input.msg?.c : undefined,
        model: input.model?.t === tag ? input.model?.c : undefined,
        msgCore: input.msgCore?.t === tag ? input.msgCore?.c : undefined,
        msgServer: input.msgServer?.t === tag ? input.msgServer?.c : undefined,
        ctx: input.ctx,
        modelCore: input.modelCore.c,
        modelCoreBefore: input.modelCoreBefore.c
      })
      return {
        model: {
          t: tag,
          c: updated.model
        },
        eff: Eff.tag(tag, updated.eff),
        msgCmd: AppClientCmd.tag(tag, updated.msgCmd),
        msgCore: updated.msgCore
          ? updated.msgCore.map(
              (
                msgCore
              ): WithEventMeta<{
                t: T
                c: WithEventMeta<Types['MsgCore']>
              }> => ({
                eventId: msgCore.msgEvtId,
                happenedAt: msgCore.happenedAt,
                t: tag,
                c: {
                  ...msgCore,
                  msgEvtId: msgCore.msgEvtId,
                  happenedAt: msgCore.happenedAt
                }
              })
            )
          : undefined
      }
    },

    subscriptions: (input) => {
      return Sub.tag(
        tag,
        client.subscriptions({
          ctx: input.ctx,
          intervalId: input.intervalId,
          modelCore: input.modelCore.c,
          model: input.model?.c
        })
      )
    },

    View: (input) => {
      return (
        <client.View
          ctx={input.ctx}
          modelCore={input.modelCore.c}
          dispatch={(m) =>
            input.dispatch({
              t: tag,
              c: m
            })
          }
          model={input.model?.c}
        />
      )
    },

    ViewFeedItem: (input) => {
      if (client.ViewFeedItem) {
        return client.ViewFeedItem({
          ctx: input.ctx,
          msgEvt: input.msgEvt.c,
          modelCore: input.modelCore.c
        })
      }
      return null
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
const chain = <T extends GameClientTypes>(
  initial: Output<T>,
  ...updaters: ((input: T['ModelClient']) => Output<T>)[]
): Output<T> => {
  const msgCmd: AppClientCmd<{
    MsgClient: T['MsgClient']
    MsgToServer: T['MsgToServer']
  }>[] = initial.msgCmd ?? []
  const msgCores: T['MsgCore'][] = initial?.msgCore ?? []
  const eff: Eff<T['MsgClient']>[] = initial.eff ? [initial.eff] : []

  let model = initial.model
  let i = 0
  const len = updaters.length

  for (i = 0; i < len; ++i) {
    const updated = updaters[i]!(model)

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

const tagOutput = <TTag extends string, TTypes extends GameClientTypes>(
  tag: TTag,
  output: Output<TTypes>
): Output<{
  ModelClient: { t: TTag; c: TTypes['ModelClient'] }
  MsgClient: { t: TTag; c: TTypes['MsgClient'] }
  MsgToClient: { t: TTag; c: TTypes['MsgToClient'] }
  MsgToServer: { t: TTag; c: TTypes['MsgToServer'] }
  ModelCore: { t: TTag; c: TTypes['ModelCore'] }
  MsgCore: { t: TTag; c: TTypes['MsgCore'] }
  ClientCtx: TTypes['ClientCtx']
}> => {
  return {
    model: {
      t: tag,
      c: output.model
    },
    eff: output.eff ? Eff.tag(tag, output.eff) : undefined,
    msgCmd: output.msgCmd ? output.msgCmd.map((msgCmd) => AppClientCmd.tagOne(tag, msgCmd)) : undefined,
    msgCore: output.msgCore
      ? output.msgCore.map((msgCore) => ({
          eventId: msgCore.eventId,
          happenedAt: msgCore.happenedAt,
          t: tag,
          c: msgCore
        }))
      : undefined
  }
}

export const GameClient = {
  tag,
  tagOutput,
  chain
}
