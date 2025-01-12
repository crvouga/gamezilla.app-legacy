import { NonEmpty } from '~/@/array/non-empty'
import { type Sub } from '~/@/sub'
import { Msg } from '~/@/msg/msg'
import type { WithEventId } from '~/@/event-sourced/event'
import type { FrontendId } from '~/app/@/data/frontend-id'
import type { SessionId } from '~/app/@/data/session-id'
import type { UserId } from '~/app/@/data/user-id'

//
//
//
//
//

export type GameBackendModuleTypes = {
  Deps?: any
  Ctx?: any
  Model?: any
  Msg?: any
  MsgToFrontend?: any
  MsgToBackend?: any
  MsgCmdIn?: any
  MsgEvtIn?: any
  MsgCmdOut?: any
  MsgEvtOut?: any
  MsgSpace?: any
  ModelSpace?: any
}

//
//
// Input
//
//

export type Input<T extends GameBackendModuleTypes> = {
  deps: T['Deps']
  ctx: T['Ctx']
  modelSpace: T['ModelSpace']
  msgSpace?: WithEventId<T['MsgSpace']> | null
  msg?: T['Msg'] | null
  msgFrontend?:
    | (T['MsgToBackend'] & {
        frontendId: FrontendId
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

export type Output<T extends GameBackendModuleTypes> = {
  msgCmd?: T['MsgCmdOut'][]
  msgEvt?: T['MsgEvtOut'][]
  msgSpace?: T['MsgSpace'][]
}

export type GameBackendModule<T extends GameBackendModuleTypes> = {
  initDeps: (input: { ctx: T['Ctx'] }) => Promise<T['Deps']>
  init: T['Model']
  update: (input: Input<T>) => Promise<Output<T>>
  subscriptions: (input: { ctx: T['Ctx']; modelSpace: T['ModelSpace'] }) => Promise<Sub<T['Msg']>>
}

//
//
//
//
//
//
//
//

const andThen = async <T extends GameBackendModuleTypes>(
  acc: Output<T>,
  ...updates: (() => Promise<Output<T>>)[]
): Promise<Output<T>> => {
  for (const update of updates) {
    const updated = await update()
    acc = {
      msgCmd: Msg.batch(acc.msgCmd, updated.msgCmd),
      msgEvt: Msg.batch(acc.msgEvt, updated.msgEvt),
      msgSpace: Msg.batch(acc.msgSpace, updated.msgSpace),
    }
  }
  return acc
}

const tagOutput = <
  TTag extends string,
  T extends GameBackendModuleTypes,
  TTaggedCmd extends GameBackendModuleTypes['MsgCmdOut'],
>(
  tag: TTag,
  tagCmd: (msgCmd: T['MsgCmdOut'][]) => TTaggedCmd[] | null | undefined,
  output: Output<T>,
): {
  msgCmd?: TTaggedCmd[]
  msgEvt?: T['MsgEvtOut'][]
  msgSpace?: WithEventId<{ t: TTag; c: T['MsgSpace'] }>[]
} => {
  return {
    msgCmd: output.msgCmd ? (tagCmd(output.msgCmd) ?? []) : [],
    msgEvt: output.msgEvt,
    msgSpace: output.msgSpace?.map((c) => ({
      eventId: c.eventId,
      c: c,
      t: tag,
    })),
  }
}

type FixtureUpdateConfig<T extends GameBackendModuleTypes> = {
  update: (input: Input<T>) => Promise<Output<T>>
  updateSpace: (input: { ctx: T['Ctx']; modelSpace: T['ModelSpace']; msgSpace: T['MsgSpace'] }) => T['ModelSpace']
  modelSpace: T['ModelSpace']
  ctx: T['Ctx']
}

const fixtureUpdates =
  <T extends GameBackendModuleTypes>(config: FixtureUpdateConfig<T>) =>
  async (
    outputs: NonEmpty<Output<T> & { modelSpace: T['ModelSpace'] }>,
    inputs: Partial<Input<T>>[],
  ): Promise<NonEmpty<Output<T> & { modelSpace: T['ModelSpace'] }>> => {
    const [input, ...rest] = inputs
    if (!input) {
      return outputs
    }
    const lastOutput = NonEmpty.last(outputs)
    const nextOutput = await config.update({
      ctx: config.ctx,
      deps: null,
      modelSpace: lastOutput.modelSpace,
      ...input,
    })
    const msgSpace = Msg.batch(input.msgSpace, nextOutput.msgSpace)
    const nextModelSpace = msgSpace.reduce(
      (modelSpace, msgSpace) => config.updateSpace({ ctx: config.ctx, modelSpace, msgSpace }),
      lastOutput.modelSpace,
    )
    const output = {
      ...nextOutput,
      modelSpace: nextModelSpace,
    }
    return fixtureUpdates(config)([...outputs, output], rest)
  }

const fixtureUpdate =
  <T extends GameBackendModuleTypes>(config: FixtureUpdateConfig<T>) =>
  async (output: Output<T>, inputs: Partial<Input<T>>[]): Promise<Output<T> & { modelSpace: T['ModelSpace'] }> => {
    const updates = fixtureUpdates(config)
    const outputs = await updates([{ ...output, modelSpace: config.modelSpace }], inputs)
    return NonEmpty.last(outputs)
  }

export const GameBackendModule = {
  andThen,
  tagOutput,
  fixtureUpdate,
  fixtureUpdates,
}
