import { Eff } from '~/@/eff'
import { isErr } from '~/@/result'
import { Sub } from '~/@/sub'
import { andThen } from '~/app/@/frontend/and-then'
import { BackendConnectedEvt } from '~/app/@/frontend/backend-connected-evt.$msg'
import { GotSpaceMsg } from '../@/got-space-msg.$msg'
import { CurrentUserSpaceLoader } from '../space/current-user-space-loader'
import { Space } from '../space/space'
import { SpaceDbQueryCache } from '../space/space-db-query-cache'
import { FrontendCtxModule, ModelFrontend } from '../types'
import { isMsgFrontend, MsgFrontend } from './types'

const update = <T extends ModelFrontend>(input: {
  ctx: FrontendCtxModule
  model: T
  msg?: unknown
  msgIn?: unknown
}): {
  model: T
  msgOut?: unknown[]
  eff?: Eff<MsgFrontend>
} => {
  return andThen<T, MsgFrontend>(
    { model: input.model },
    (model) => updateSync({ ...input, model }),
    (model) => updateSynced({ ...input, model }),
    (model) => publishMsgSpace({ ...input, model }),
    (model) => outputMsgSpaces({ ...input, model }),
  )
}

const outputMsgSpaces: typeof update = (input) => {
  if (!isMsgFrontend(input.msg)) return { model: input.model }

  switch (input.msg?.t) {
    case 'sync_gotMsgSpace': {
      return {
        model: input.model,
        msgSpace: [input.msg.c],
      }
    }
  }

  return { model: input.model }
}

const publishMsgSpace: typeof update = (input) => {
  if (!GotSpaceMsg.is(input.msgIn)) return { model: input.model }

  const msgSpace = input.msgIn.c

  if (!msgSpace) return { model: input.model }

  const space = SpaceDbQueryCache.entity(input.ctx, msgSpace.spaceId)

  if (!space) return { model: input.model }

  const spaceEventWithMeta = Space.toSpaceEventWithMeta(space, msgSpace.eventId)

  if (!spaceEventWithMeta) return { model: input.model }

  return {
    model: input.model,
    eff() {
      input.ctx.topic.spaces_msg.pub(spaceEventWithMeta.spaceId, spaceEventWithMeta)
    },
  }
}

const updateSync: typeof update = (input) => {
  if (BackendConnectedEvt.is(input.msgIn)) {
    const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

    if (!currentUserSpace) return { model: input.model }

    return {
      model: input.model,
      async eff(dispatch) {
        const synced = await input.ctx.rpc.spaces_sync({ space: currentUserSpace })
        dispatch({ t: 'sync_synced', synced })
      },
    }
  }

  return { model: input.model }
}

const updateSynced: typeof update = (input) => {
  if (!isMsgFrontend(input.msg)) return { model: input.model }

  switch (input.msg?.t) {
    case 'sync_synced': {
      const { synced } = input.msg

      if (isErr(synced)) return { model: input.model }

      const space = Space.toSpaceStarted(synced.value.space)

      return { model: { ...input.model, spaces: [space] } }
    }
  }

  return { model: input.model }
}

const subscriptions = (input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<MsgFrontend> => {
  const currentUserSpaceId = CurrentUserSpaceLoader.toCurrentUserSpaceId(input.ctx)

  if (!currentUserSpaceId) return Sub.none()

  return input.ctx.topic.spaces_msg.sub(currentUserSpaceId, (c) => ({ t: 'sync_gotMsgSpace', c }))
}

export const SyncFrontend = {
  update,
  subscriptions,
}
