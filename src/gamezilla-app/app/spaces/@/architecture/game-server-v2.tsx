import { type Sub } from 'gamezilla-app/@/core'
import { Msg } from 'gamezilla-app/@/core/msg'
import type { ClientId, SessionId, UserId } from 'gamezilla-app/app/@/data'
import type { EventId, WithEventId } from '../event'

//
//
//
//
//

export type GameServerModuleTypes = {
  Deps?: any
  Ctx?: any
  Model?: any
  Msg?: any
  MsgToClient?: any
  MsgToServer?: any
  MsgCmdIn?: any
  MsgEvtIn?: any
  MsgCmdOut?: any
  MsgEvtOut?: any
  MsgCore?: any
  ModelCore?: any
}

//
//
// Input
//
//

export type Input<T extends GameServerModuleTypes> = {
  deps: T['Deps']
  ctx: T['Ctx']
  // model: T['Model']
  modelCore: T['ModelCore']
  msgCore?: (T['MsgCore'] & { eventId: EventId }) | null
  msg?: T['Msg'] | null
  msgClient?:
    | (T['MsgToServer'] & {
        clientId: ClientId
        sessionId: SessionId
        userId: UserId
      })
    | null
  msgEvt?: T['MsgEvtIn'] | null
  msgCmd?: T['MsgCmdIn'] | null
}

//
//
// Output
//
//

export type Output<T extends GameServerModuleTypes> = {
  // model: T['Model']
  // eff?: Eff<T['Msg']>
  msgCmd?: T['MsgCmdOut'][]
  msgEvt?: T['MsgEvtOut'][]
  msgCore?: WithEventId<T['MsgCore']>[]
}

export type GameServerModule<T extends GameServerModuleTypes> = {
  deps: (input: { ctx: T['Ctx'] }) => Promise<T['Deps']>
  init: T['Model']
  update: (input: Input<T>) => Promise<Output<T>>
  subscriptions: (input: { ctx: T['Ctx']; modelCore: T['ModelCore']; model: T['Model'] }) => Promise<Sub<T['Msg']>>
}

//
//
//
//
//
//
//
//

export const andThen = async <T extends GameServerModuleTypes>(
  acc: Output<T>,
  ...updates: (() => Promise<Output<T>>)[]
): Promise<Output<T>> => {
  for (const update of updates) {
    const updated = await update()
    acc = {
      msgCmd: Msg.batch(acc.msgCmd, updated.msgCmd),
      msgEvt: Msg.batch(acc.msgEvt, updated.msgEvt),
      msgCore: Msg.batch(acc.msgCore, updated.msgCore)
    }
  }
  return acc
}

const tagOutput = <
  TTag extends string,
  T extends GameServerModuleTypes,
  TTaggedCmd extends GameServerModuleTypes['MsgCmdOut']
>(
  tag: TTag,
  tagCmd: (msgCmd: T['MsgCmdOut'][]) => TTaggedCmd[] | null | undefined,
  output: Output<T>
): {
  msgCmd?: TTaggedCmd[]
  msgEvt?: T['MsgEvtOut'][]
  msgCore?: WithEventId<{ t: TTag; c: T['MsgCore'] }>[]
} => {
  return {
    msgCmd: output.msgCmd ? tagCmd(output.msgCmd) ?? [] : [],
    msgEvt: output.msgEvt,
    msgCore: output.msgCore?.map((c) => ({
      eventId: c.eventId,
      c: c,
      t: tag
    }))
  }
}

export const GameServerModule = {
  andThen,
  tagOutput
}
