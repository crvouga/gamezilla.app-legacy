import { Eff } from '~/@/eff'
import type { WithEventId, WithEventMeta } from '~/@/event-sourced/event'
import { Sub } from '~/@/sub'
import type { VDom } from '~/@/vdom/vdom'

export type GameFrontendTypes = {
  //
  ModelFrontend: any
  MsgFrontend: any
  //
  MsgToFrontend: any
  MsgToBackend: any
  //
  ModelSpace: any
  MsgSpace: any
  //
  FrontendCtx: any
}

type Output<T extends GameFrontendTypes> = {
  model: T['ModelFrontend']
  eff?: Eff<T['MsgFrontend']>
  msgSpace?: WithEventId<T['MsgSpace']>[]
}

export type GameFrontend<T extends GameFrontendTypes> = {
  init: (input: { ctx: T['FrontendCtx']; modelSpace: T['ModelSpace']; model?: T['ModelFrontend'] | null }) => Output<T>

  update: (input: {
    ctx: T['FrontendCtx']
    modelSpace: T['ModelSpace']
    modelSpaceBefore: T['ModelSpace']
    model?: T['ModelFrontend'] | null
    //
    msg?: T['MsgFrontend'] | null
    msgBackend?: T['MsgToFrontend'] | null
    msgSpace?: WithEventMeta<T['MsgSpace']> | null
  }) => Output<T>

  subscriptions: (input: {
    intervalId: string
    ctx: T['FrontendCtx']
    model?: T['ModelFrontend'] | null
    modelSpace: T['ModelSpace']
  }) => Sub<T['MsgFrontend']>

  View: (input: {
    ctx: T['FrontendCtx']
    dispatch: (msg: T['MsgFrontend']) => void
    modelSpace: T['ModelSpace']
    model?: T['ModelFrontend'] | null
  }) => VDom

  ViewFeedItem: (input: { ctx: T['FrontendCtx']; modelSpace: T['ModelSpace']; msgEvt: T['MsgSpace'] }) => VDom
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
  const msgSpaces: T['MsgSpace'][] = initial?.msgSpace ?? []
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
    if (updated.msgSpace) {
      let j = 0
      const len = updated.msgSpace.length
      for (j = 0; j < len; ++j) {
        msgSpaces.push(updated.msgSpace[j]!)
      }
    }
  }

  return {
    model,
    eff: Eff.batch(eff),
    msgSpace: msgSpaces,
  }
}

export const GameFrontend = {
  chain,
}
