import { Eff, type Sub } from 'gamezilla-app/@/core'
import type { VDom } from 'gamezilla-app/@/vdom'
import type { WithEventId } from '../event'
import { Msg } from 'gamezilla-app/@/core/msg'

//
//
//
//
//

type Any = any

export type GameClientModuleTypes = {
  Ctx?: Any
  Model?: Any
  Msg?: Any
  MsgToClient?: Any
  MsgToServer?: Any
  MsgCmdIn?: Any
  MsgCmdOut?: Any
  MsgEvtIn?: Any
  MsgEvtOut?: Any
  MsgCore?: Any
  ModelCore?: Any
  ViewSlot?: SlotInputTypes
  ViewEmit?: EmitInputTypes
}
export type GameClientModuleTypesConfig<T extends GameClientModuleTypes> = T

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

export type Input<T extends GameClientModuleTypes> = {
  ctx: T['Ctx']
  model: T['Model']
  msg?: T['Msg'] | null
  msgServer?: T['MsgToClient'] | null
  msgEvt?: T['MsgEvtIn'] | null
  msgCmd?: T['MsgCmdIn'] | null
  modelCore: T['ModelCore']
  msgCore?: WithEventId<T['MsgCore']> | null
}

//
//
// Output
//
//

export type Output<T extends GameClientModuleTypes> = {
  model: T['Model']
  eff?: Eff<T['Msg']>
  msgCmd?: T['MsgCmdOut'][]
  msgEvt?: T['MsgEvtOut'][]
  msgCore?: WithEventId<T['MsgCore']>[]
}

export type GameClientModule<T extends GameClientModuleTypes> = {
  init: T['Model']

  update: (input: Input<T>) => Output<T>

  subscriptions: (input: { ctx: T['Ctx']; modelCore: T['ModelCore']; model: T['Model'] }) => Sub<T['Msg']>

  View: (input: {
    ctx: T['Ctx']
    modelCore: T['ModelCore']
    model: T['Model']
    dispatch: (msg: T['Msg']) => void
    slots?: SlotRenderFunctions<T['ViewSlot']>
    emits?: EmitFunctions<T['ViewEmit']>
  }) => VDom

  ViewFeedItem: (input: {
    ctx: T['Ctx']
    msgCore: T['MsgCore']
    modelCore: T['ModelCore']
    dispatch: (msg: T['Msg']) => void
  }) => VDom
}

export type InferOutput<T extends GameClientModule<any>> = T extends GameClientModule<infer U> ? Output<U> : never

export type InferInput<T extends GameClientModule<any>> = T extends GameClientModule<infer U> ? Input<U> : never

//
//
//
//
//
//
//

export const andThen = <T extends GameClientModuleTypes>(
  acc: Output<T>,
  ...updates: ((model: T['Model']) => Output<T>)[]
): Output<T> => {
  for (const update of updates) {
    const updated = update(acc.model)
    acc = {
      model: updated.model,
      eff: Eff.batch(acc.eff, updated.eff),
      msgEvt: Msg.batch(acc.msgEvt, updated.msgEvt),
      msgCmd: Msg.batch(acc.msgCmd, updated.msgCmd),
      msgCore: Msg.batch(acc.msgCore, updated.msgCore)
    }
  }

  return acc
}

const tagOutput = <
  TTag extends string,
  T extends GameClientModuleTypes,
  TTaggedCmd extends GameClientModuleTypes['MsgCmdOut']
>(
  tag: TTag,
  tagCmd: (msgCmd: T['MsgCmdOut'][]) => TTaggedCmd[],
  output: Output<T>
): {
  model: { t: TTag; c: T['Model'] }
  eff?: Eff<{ t: TTag; c: T['Msg'] }>
  msgCmd?: TTaggedCmd[]
  msgEvt?: T['MsgEvtOut'][]
  msgCore?: WithEventId<{ t: TTag; c: T['MsgCore'] }>[]
} => {
  return {
    model: {
      t: tag,
      c: output.model
    },
    msgCmd: output.msgCmd ? tagCmd(output.msgCmd) : [],
    eff: Eff.tag(tag, output.eff),
    msgEvt: output.msgEvt,
    msgCore: output.msgCore?.map((c) => {
      const eventId = c.eventId
      c.eventId = undefined
      return {
        eventId,
        c,
        t: tag
      }
    })
  }
}

export const GameClientModule = {
  andThen,
  tagOutput
}
