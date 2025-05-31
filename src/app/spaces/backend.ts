import { Msg } from '~/@/msg/msg'
import { isErr } from '~/@/result'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { Topic } from '~/@/topic'
import { AppBackendCtxBase } from '../@/backend/ctx'
import { Space } from './@/space/space'
import { type Input, type Output, SpaceBackendModule } from './architecture/space-backend'
import { SpacesCoreAsync } from './core/core-async'
import { GameBackend } from './game/backend'
import { ListSpacesBackend } from './list-spaces/backend'
import { SyncBackend } from './sync/backend'
import { type BackendModule, MsgBackend, rpcContract, type SpaceBackendCtxModule, topicContract } from './types'

const initCtx = async (input: {
  ctx: AppBackendCtxBase
  topic: Topic.Client<typeof topicContract>
}): Promise<SpaceBackendCtxModule> => {
  return {
    ...input.ctx,
    topic: input.topic,
    games: GameBackend.initCtx({
      ctx: { ...input.ctx, space: Space.random() },
    }),
    spacesCore: await SpacesCoreAsync({
      t: 'key-value-db',
      keyValueDb: input.ctx.keyValueDb,
      logger: input.ctx.logger,
      runtime: input.ctx.runtime,
      writeThrottle: TimeSpan.seconds(10),
      namespace: [],
    }),
  }
}

const update: BackendModule['update'] = async (input) => {
  await updateLoop(input)

  return {}
}

const updateLoop = async (input: Input, initialAcc?: Output): Promise<Output> => {
  const acc = initialAcc ?? (await updateChild(input))

  const [spaceEvt, ...spaceEvtRest] = acc.msgSpace ?? []

  if (spaceEvt) {
    const updated = await updateChild({
      ctx: input.ctx,
      msgSpace: spaceEvt,
    })

    return updateLoop(input, {
      msgSpace: Msg.batch(spaceEvtRest, updated.msgSpace),
      msgEvt: updated.msgEvt,
    })
  }

  return acc
}

const updateChild: SpaceBackendModule['update'] = async (input) => {
  return SpaceBackendModule.andThen(
    {},
    () => updateSpacesFromMsgSpace(input),
    () => SyncBackend.update(input),
    () => GameBackend.update(input),
  )
}

const updateSpacesFromMsgSpace: SpaceBackendModule['update'] = async (input) => {
  if (!input.msgSpace) return {}

  const updated = await input.ctx.spacesCore.update(input.msgSpace)

  if (isErr(updated)) {
    input.ctx.logger.error(updated.error)
  }

  return {}
}

const subscriptions: BackendModule['subscriptions'] = async (input) => {
  return Sub.batch<MsgBackend>([
    //
    await GameBackend.subscriptions(input),
    await SyncBackend.subscriptions(input),
  ])
}

const rpc = (input: { ctx: SpaceBackendCtxModule }) => {
  return RPC.initServer(rpcContract, {
    sync: SyncBackend.rpc(input),
    listSpaces: ListSpacesBackend.rpc(input),
  })
}

export const SpacesBackend = {
  initCtx,
  update,
  subscriptions,
  rpc,
}
