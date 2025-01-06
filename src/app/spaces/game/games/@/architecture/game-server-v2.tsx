import { NonEmpty } from '~/@/array/non-empty'
import { type Sub } from '~/@/sub'
import { Msg } from '~/@/msg/msg'
import type { WithEventId } from '~/@/event-sourced/event'
import type { ClientId } from '~/app/@/data/client-id'
import type { SessionId } from '~/app/@/data/session-id'
import type { UserId } from '~/app/@/data/user-id'

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
  modelCore: T['ModelCore']
  msgCore?: WithEventId<T['MsgCore']> | null
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
  msgCmd?: T['MsgCmdOut'][]
  msgEvt?: T['MsgEvtOut'][]
  msgCore?: T['MsgCore'][]
}

export type GameServerModule<T extends GameServerModuleTypes> = {
  initDeps: (input: { ctx: T['Ctx'] }) => Promise<T['Deps']>
  init: T['Model']
  update: (input: Input<T>) => Promise<Output<T>>
  subscriptions: (input: { ctx: T['Ctx']; modelCore: T['ModelCore'] }) => Promise<Sub<T['Msg']>>
}

//
//
//
//
//
//
//
//

const andThen = async <T extends GameServerModuleTypes>(
  acc: Output<T>,
  ...updates: (() => Promise<Output<T>>)[]
): Promise<Output<T>> => {
  for (const update of updates) {
    const updated = await update()
    acc = {
      msgCmd: Msg.batch(acc.msgCmd, updated.msgCmd),
      msgEvt: Msg.batch(acc.msgEvt, updated.msgEvt),
      msgCore: Msg.batch(acc.msgCore, updated.msgCore),
    }
  }
  return acc
}

const tagOutput = <
  TTag extends string,
  T extends GameServerModuleTypes,
  TTaggedCmd extends GameServerModuleTypes['MsgCmdOut'],
>(
  tag: TTag,
  tagCmd: (msgCmd: T['MsgCmdOut'][]) => TTaggedCmd[] | null | undefined,
  output: Output<T>,
): {
  msgCmd?: TTaggedCmd[]
  msgEvt?: T['MsgEvtOut'][]
  msgCore?: WithEventId<{ t: TTag; c: T['MsgCore'] }>[]
} => {
  return {
    msgCmd: output.msgCmd ? (tagCmd(output.msgCmd) ?? []) : [],
    msgEvt: output.msgEvt,
    msgCore: output.msgCore?.map((c) => ({
      eventId: c.eventId,
      c: c,
      t: tag,
    })),
  }
}

type FixtureUpdateConfig<T extends GameServerModuleTypes> = {
  update: (input: Input<T>) => Promise<Output<T>>
  updateCore: (input: { ctx: T['Ctx']; modelCore: T['ModelCore']; msgCore: T['MsgCore'] }) => T['ModelCore']
  modelCore: T['ModelCore']
  ctx: T['Ctx']
}

const fixtureUpdates =
  <T extends GameServerModuleTypes>(config: FixtureUpdateConfig<T>) =>
  async (
    outputs: NonEmpty<Output<T> & { modelCore: T['ModelCore'] }>,
    inputs: Partial<Input<T>>[],
  ): Promise<NonEmpty<Output<T> & { modelCore: T['ModelCore'] }>> => {
    const [input, ...rest] = inputs
    if (!input) {
      return outputs
    }
    const lastOutput = NonEmpty.last(outputs)
    const nextOutput = await config.update({
      ctx: config.ctx,
      deps: null,
      modelCore: lastOutput.modelCore,
      ...input,
    })
    const msgCore = Msg.batch(input.msgCore, nextOutput.msgCore)
    const nextModelCore = msgCore.reduce(
      (modelCore, msgCore) => config.updateCore({ ctx: config.ctx, modelCore, msgCore }),
      lastOutput.modelCore,
    )
    const output = {
      ...nextOutput,
      modelCore: nextModelCore,
    }
    return fixtureUpdates(config)([...outputs, output], rest)
  }

const fixtureUpdate =
  <T extends GameServerModuleTypes>(config: FixtureUpdateConfig<T>) =>
  async (output: Output<T>, inputs: Partial<Input<T>>[]): Promise<Output<T> & { modelCore: T['ModelCore'] }> => {
    const updates = fixtureUpdates(config)
    const outputs = await updates([{ ...output, modelCore: config.modelCore }], inputs)
    return NonEmpty.last(outputs)
  }

export const GameServerModule = {
  andThen,
  tagOutput,
  fixtureUpdate,
  fixtureUpdates,
}
