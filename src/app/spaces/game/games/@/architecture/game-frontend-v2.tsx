import { Eff } from '~/@/eff'
import { WithEventId } from '~/@/event-sourced/event'
import { Msg } from '~/@/msg/msg'
import { Sub } from '~/@/sub'
import type { VDom } from '~/@/vdom/vdom'

//
//
//
//
//

type Any = any

export type GameFrontendModuleTypes = {
  Ctx?: Any
  Model?: Any
  Msg?: Any
  MsgToFrontend?: Any
  MsgToBackend?: Any
  MsgIn?: unknown
  MsgOut?: unknown
  MsgSpace?: Any
  ModelSpace?: Any
  ViewSlot?: SlotInputTypes
  ViewEmit?: EmitInputTypes
}
export type GameFrontendModuleTypesConfig<T extends GameFrontendModuleTypes> = T

type SlotInputTypes = {
  [key: string]: Any
}

type EmitInputTypes = {
  [key: string]: Any
}
type SlotRenderFunctions<Slots> = Slots extends SlotInputTypes
  ? { [K in keyof Slots]: (input: Slots[K]) => VDom }
  : Record<string, unknown>

type EmitFunctions<Emits> = Emits extends EmitInputTypes
  ? { [K in keyof Emits]: (input: Emits[K]) => void }
  : Record<string, unknown>

//
//
// Input
//
//

export type Input<T extends GameFrontendModuleTypes> = {
  ctx: T['Ctx']
  model: T['Model']
  msg?: T['Msg'] | null
  msgBackend?: T['MsgToFrontend'] | null
  msgIn?: T['MsgIn'] | null
  modelSpace: T['ModelSpace']
  msgSpace?: WithEventId<T['MsgSpace']> | null
}

//
//
// Output
//
//

export type Output<T extends GameFrontendModuleTypes> = {
  model: T['Model']
  eff?: Eff<T['Msg']>
  msgSpace?: T['MsgSpace'][]
  msgOut?: unknown[]
}

export type GameFrontendModule<T extends GameFrontendModuleTypes> = {
  init: T['Model']

  update: (input: Input<T>) => Output<T>

  subscriptions: (input: { ctx: T['Ctx']; modelSpace: T['ModelSpace']; model: T['Model'] }) => Sub<T['Msg']>

  View: (input: {
    ctx: T['Ctx']
    modelSpace: T['ModelSpace']
    model: T['Model']
    dispatch: (msg: T['Msg']) => void
    slots?: SlotRenderFunctions<T['ViewSlot']>
    emits?: EmitFunctions<T['ViewEmit']>
  }) => VDom

  ViewFeedItem: (input: {
    ctx: T['Ctx']
    msgSpace: T['MsgSpace']
    modelSpace: T['ModelSpace']
    dispatch: (msg: T['Msg']) => void
  }) => VDom
}

export type InferOutput<T extends GameFrontendModule<any>> = T extends GameFrontendModule<infer U> ? Output<U> : never

export type InferInput<T extends GameFrontendModule<any>> = T extends GameFrontendModule<infer U> ? Input<U> : never

//
//
//
//
//
//
//

const andThen = <T extends GameFrontendModuleTypes>(
  acc: Output<T>,
  ...updates: ((model: T['Model']) => Output<T>)[]
): Output<T> => {
  for (const update of updates) {
    const updated = update(acc.model)
    acc = {
      model: updated.model,
      eff: Eff.batch(acc.eff, updated.eff),
      msgOut: Msg.batch(acc.msgOut, updated.msgOut),
      msgSpace: Msg.batch(acc.msgSpace, updated.msgSpace),
    }
  }

  return acc
}

const tagOutput = <TTag extends string, T extends GameFrontendModuleTypes>(
  tag: TTag,
  output: Output<T>,
): {
  model: { t: TTag; c: T['Model'] }
  eff?: Eff<{ t: TTag; c: T['Msg'] }>
  msgOut?: unknown[]
  msgSpace?: { t: TTag; c: T['MsgSpace'] }[]
} => {
  return {
    model: {
      t: tag,
      c: output.model,
    },
    msgOut: output.msgOut,
    eff: Eff.tag(tag, output.eff),
    msgSpace: output.msgSpace?.map((c) => ({
      c,
      t: tag,
    })),
  }
}

export const GameFrontendModule = {
  andThen,
  tagOutput,
}
