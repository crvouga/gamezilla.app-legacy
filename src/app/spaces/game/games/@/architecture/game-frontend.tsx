import type { WithEventId, WithEventMeta } from '~/@/event-sourced/event'
import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import type { VDom } from '~/@/vdom/vdom'
import { AppFrontendCmd } from '~/app/@/frontend/cmd'
import { FrontendEvt } from '~/app/@/frontend/evt'

export type GameFrontendTypes = {
  //
  ModelFrontend: any
  MsgFrontend: any
  //
  MsgToFrontend: any
  MsgToBackend: any
  //
  ModelCore: any
  MsgCore: any
  //
  FrontendCtx: any
}

type Output<T extends GameFrontendTypes> = {
  model: T['ModelFrontend']
  eff?: Eff<T['MsgFrontend']>
  msgCmd?: AppFrontendCmd<{
    MsgFrontend: T['MsgFrontend']
    MsgToBackend: T['MsgToBackend']
  }>[]
  msgCore?: WithEventId<T['MsgCore']>[]
}

export type InMsg<T extends GameFrontendTypes> =
  | ({ variant: 'msg' } & T['MsgFrontend'])
  | ({ variant: 'to-frontend' } & T['MsgToFrontend'])
  | ({ variant: 'event' } & FrontendEvt)

export type OutMsg<T extends GameFrontendTypes> =
  | ({ variant: 'msgCmd' } & AppFrontendCmd<T>)
  | ({ variant: 'game-event' } & WithEventId<T['MsgCore']>)

export type GameFrontend<T extends GameFrontendTypes> = {
  init: (input: { ctx: T['FrontendCtx']; modelCore: T['ModelCore']; model?: T['ModelFrontend'] | null }) => Output<T>

  update: (input: {
    ctx: T['FrontendCtx']
    modelCore: T['ModelCore']
    modelCoreBefore: T['ModelCore']
    model?: T['ModelFrontend'] | null
    //
    msg?: T['MsgFrontend'] | null
    msgBackend?: T['MsgToFrontend'] | null
    msgEvt?: FrontendEvt | null
    msgCore?: WithEventMeta<T['MsgCore']> | null
  }) => Output<T>

  subscriptions: (input: {
    intervalId: string
    ctx: T['FrontendCtx']
    model?: T['ModelFrontend'] | null
    modelCore: T['ModelCore']
  }) => Sub<T['MsgFrontend']>

  View: (input: {
    ctx: T['FrontendCtx']
    dispatch: (msg: T['MsgFrontend']) => void
    modelCore: T['ModelCore']
    model?: T['ModelFrontend'] | null
  }) => VDom

  ViewFeedItem: (input: { ctx: T['FrontendCtx']; modelCore: T['ModelCore']; msgEvt: T['MsgCore'] }) => VDom
}

/**
 * Tags all the messages and models that are inputted and outputted from this module.
 */
export const tag = <T extends string, Types extends GameFrontendTypes>(
  tag: T,
  frontend: GameFrontend<Types>,
): GameFrontend<{
  ModelFrontend: { t: T; c: Types['ModelFrontend'] }
  MsgFrontend: { t: T; c: Types['MsgFrontend'] }
  MsgToFrontend: { t: T; c: Types['MsgToFrontend'] }
  MsgToBackend: { t: T; c: Types['MsgToBackend'] }
  ModelCore: { t: T; c: Types['ModelCore'] }
  MsgCore: { t: T; c: Types['MsgCore'] }
  FrontendCtx: Types['FrontendCtx']
}> => {
  return {
    init: (input) => {
      const initial = frontend.init({
        ctx: input.ctx,
        modelCore: input.modelCore.c,
        model: input.model?.c,
      })
      return {
        model: {
          t: tag,
          c: initial.model,
        },
        eff: Eff.tag(tag, initial.eff),
        msgCmd: AppFrontendCmd.tag(tag, initial.msgCmd),
      }
    },

    update: (input) => {
      const updated = frontend.update({
        msgEvt: input.msgEvt,
        msg: input.msg?.t === tag ? input.msg?.c : undefined,
        model: input.model?.t === tag ? input.model?.c : undefined,
        msgCore: input.msgCore?.t === tag ? input.msgCore?.c : undefined,
        msgBackend: input.msgBackend?.t === tag ? input.msgBackend?.c : undefined,
        ctx: input.ctx,
        modelCore: input.modelCore.c,
        modelCoreBefore: input.modelCoreBefore.c,
      })
      return {
        model: {
          t: tag,
          c: updated.model,
        },
        eff: Eff.tag(tag, updated.eff),
        msgCmd: AppFrontendCmd.tag(tag, updated.msgCmd),
        msgCore: updated.msgCore
          ? updated.msgCore.map(
              (
                msgCore,
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
                  happenedAt: msgCore.happenedAt,
                },
              }),
            )
          : undefined,
      }
    },

    subscriptions: (input) => {
      return Sub.tag(
        tag,
        frontend.subscriptions({
          ctx: input.ctx,
          intervalId: input.intervalId,
          modelCore: input.modelCore.c,
          model: input.model?.c,
        }),
      )
    },

    View: (input) => {
      return (
        <frontend.View
          ctx={input.ctx}
          modelCore={input.modelCore.c}
          dispatch={(m) =>
            input.dispatch({
              t: tag,
              c: m,
            })
          }
          model={input.model?.c}
        />
      )
    },

    ViewFeedItem: (input) => {
      if (frontend.ViewFeedItem) {
        return frontend.ViewFeedItem({
          ctx: input.ctx,
          msgEvt: input.msgEvt.c,
          modelCore: input.modelCore.c,
        })
      }
      return null
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
const chain = <T extends GameFrontendTypes>(
  initial: Output<T>,
  ...updaters: ((input: T['ModelFrontend']) => Output<T>)[]
): Output<T> => {
  const msgCmd: AppFrontendCmd<{
    MsgFrontend: T['MsgFrontend']
    MsgToBackend: T['MsgToBackend']
  }>[] = initial.msgCmd ?? []
  const msgCores: T['MsgCore'][] = initial?.msgCore ?? []
  const eff: Eff<T['MsgFrontend']>[] = initial.eff ? [initial.eff] : []

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
    msgCmd,
  }
}

const tagOutput = <TTag extends string, TTypes extends GameFrontendTypes>(
  tag: TTag,
  output: Output<TTypes>,
): Output<{
  ModelFrontend: { t: TTag; c: TTypes['ModelFrontend'] }
  MsgFrontend: { t: TTag; c: TTypes['MsgFrontend'] }
  MsgToFrontend: { t: TTag; c: TTypes['MsgToFrontend'] }
  MsgToBackend: { t: TTag; c: TTypes['MsgToBackend'] }
  ModelCore: { t: TTag; c: TTypes['ModelCore'] }
  MsgCore: { t: TTag; c: TTypes['MsgCore'] }
  FrontendCtx: TTypes['FrontendCtx']
}> => {
  return {
    model: {
      t: tag,
      c: output.model,
    },
    eff: output.eff ? Eff.tag(tag, output.eff) : undefined,
    msgCmd: output.msgCmd ? output.msgCmd.map((msgCmd) => AppFrontendCmd.tagOne(tag, msgCmd)) : undefined,
    msgCore: output.msgCore
      ? output.msgCore.map((msgCore) => ({
          eventId: msgCore.eventId,
          happenedAt: msgCore.happenedAt,
          t: tag,
          c: msgCore,
        }))
      : undefined,
  }
}

export const GameFrontend = {
  tag,
  tagOutput,
  chain,
}
