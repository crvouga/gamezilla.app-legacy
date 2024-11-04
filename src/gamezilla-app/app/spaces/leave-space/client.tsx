import { withEventId } from 'gamezilla-app/@/event-sourced/event'
import { APP_SOUND, playSound, pushRoute, showToast } from 'gamezilla-app/app/@/client'
import { Button } from 'gamezilla-app/app/@/ui'
import { SpaceClientModule } from '../@/architecture/space-client'
import type { SpaceEvent } from '../core'
import * as SpacesCoreClient from '../core/client/spaces-core.client'

const update: SpaceClientModule['update'] = (input) => {
  return SpaceClientModule.andThen(
    { model: input.model },
    (model) =>
      updateFromSpaceEvent({
        ...input,
        model
      }),
    (model) =>
      updateLeaveSpaceButton({
        ...input,
        model
      })
  )
}

const updateFromSpaceEvent: SpaceClientModule['update'] = ({ model, msgCore: msgCore, ctx }) => {
  switch (msgCore?.t) {
    case 'user-left-space': {
      if (!ctx.currentUserId) {
        return {
          model
        }
      }

      const currentUserSpaceId = SpacesCoreClient.toSpaceIdByUserId(model, ctx.currentUserId)

      if (msgCore.spaceId !== currentUserSpaceId) {
        return {
          model
        }
      }

      if (msgCore.userId !== ctx.currentUserId) {
        const username = ctx.profiles[msgCore.userId]?.username
        return {
          model,
          msgCmd: [
            playSound(APP_SOUND.navBackward),
            username
              ? showToast(ctx.t('spaces.other-user-left', username))
              : showToast(ctx.t('spaces.current-user-left'))
          ]
        }
      }

      return {
        model,
        msgCmd: [
          playSound(APP_SOUND.navBackward),
          showToast(ctx.t('spaces.current-user-left')),
          pushRoute({
            n: 'spaces',
            t: 'space-list'
          })
        ]
      }
    }
    default: {
      return {
        model
      }
    }
  }
}

const updateLeaveSpaceButton: SpaceClientModule['update'] = ({ ctx, model, msg }) => {
  switch (msg?.t) {
    case 'clicked-leave-space-button': {
      if (!ctx.currentUserId) {
        return {
          model
        }
      }

      const currentUserSpaceId = SpacesCoreClient.toSpaceIdByUserId(model, ctx.currentUserId)

      if (!currentUserSpaceId) {
        return {
          model
        }
      }

      const spaceEventNew = withEventId<SpaceEvent>({
        t: 'user-left-space',
        spaceId: currentUserSpaceId,
        userId: ctx.currentUserId
      })

      return {
        model,
        msgCore: [spaceEventNew]
      }
    }

    default: {
      return {
        model
      }
    }
  }
}

const ViewLeaveSpaceButton: SpaceClientModule['View'] = (input) => {
  const userSpaceId = input.ctx.currentUserId ? input.model.indexSpaceIdByUserId[input.ctx.currentUserId] : null

  if (!userSpaceId) {
    return null
  }

  return (
    <Button
      color='danger'
      variant='text'
      size='sm'
      text={input.ctx.t('spaces.leave')}
      onClick={() =>
        input.dispatch({
          t: 'clicked-leave-space-button',
          spaceId: userSpaceId
        })
      }
    />
  )
}

export const LeaveSpaceClient = {
  update,
  ViewLeaveSpaceButton
}
