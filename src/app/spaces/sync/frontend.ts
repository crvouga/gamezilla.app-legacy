import { EventSourced } from '~/@/event-sourced'
import { isErr } from '~/@/result'
import { Sub } from '~/@/sub'
import { BackendConnectedEvt } from '~/app/@/frontend/backend-connected-evt.$msg'
import { SpaceFrontendModule } from '../frontend/space-frontend'
import { Spaces } from '../space/spaces'

const update: SpaceFrontendModule['update'] = (input) => {
  return SpaceFrontendModule.andThen(
    { model: input.model },
    (model) => updateSync({ ...input, model }),
    (model) => updateSynced({ ...input, model }),
    (model) => publishMsgSpace({ ...input, model }),
    (model) => outputMsgSpaces({ ...input, model }),
  )
}

const outputMsgSpaces: SpaceFrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'sync.got-msg-space': {
      return {
        model: input.model,
        msgSpace: [input.msg.c],
      }
    }
  }

  return { model: input.model }
}

const publishMsgSpace: SpaceFrontendModule['update'] = (input) => {
  if (!input.msgSpace) return { model: input.model }

  const spaceEventWithMeta = Spaces.toEventWithMeta(input.model.spaces, input.msgSpace.spaceId, input.msgSpace.eventId)

  if (!spaceEventWithMeta) return { model: input.model }

  return {
    model: input.model,
    eff() {
      input.ctx.topic['spaces/msg'].pub(spaceEventWithMeta.spaceId, spaceEventWithMeta)
    },
  }
}

const updateSync: SpaceFrontendModule['update'] = (input) => {
  if (BackendConnectedEvt.is(input.msgIn)) {
    const currentUserId = input.ctx.currentUser?.userId

    if (!currentUserId) return { model: input.model }

    const currentUserSpace = Spaces.toSpaceByUserId({
      model: input.model.spaces,
      userId: currentUserId,
    })

    if (!currentUserSpace) return { model: input.model }

    const space = EventSourced.startFromLatestSnapshot(currentUserSpace)

    return {
      model: input.model,
      async eff(dispatch) {
        const synced = await input.ctx.rpc['spaces.sync.sync']({ space })
        dispatch({ t: 'sync.synced', synced })
      },
    }
  }

  return { model: input.model }
}

const updateSynced: SpaceFrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'sync.synced': {
      const { synced } = input.msg

      if (isErr(synced)) return { model: input.model }

      const merged = Spaces.merge(input.model.spaces, [synced.value.space])

      return { model: { ...input.model, spaces: merged } }
    }
  }

  return { model: input.model }
}

const subscriptions: SpaceFrontendModule['subscriptions'] = (input) => {
  const currentUserSpaceId = Spaces.toSpaceIdByUserId(input.model.spaces, input.ctx.currentUser?.userId)

  if (!currentUserSpaceId) return Sub.none()

  return input.ctx.topic['spaces/msg'].sub(currentUserSpaceId, (c) => ({ t: 'sync.got-msg-space', c }))
}

export const SyncFrontend = {
  update,
  subscriptions,
}
