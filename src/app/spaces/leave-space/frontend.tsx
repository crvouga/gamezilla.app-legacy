import { withEventId } from '~/@/event-sourced/event'
import { APP_SOUND, playSound, pushScreen, showToast } from '~/app/@/frontend/cmd'
import { Button } from '~/app/@/ui'
import { SpaceFrontendModule } from '../@/architecture/space-frontend'
import { SpacesSpaceFrontend } from '../space/frontend'
import type { SpaceEvent } from '../space/space-event'

const update: SpaceFrontendModule['update'] = (input) => {
  return SpaceFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromSpaceEvent({ ...input, model }),
    (model) => updateLeaveSpaceButton({ ...input, model }),
  )
}

const updateFromSpaceEvent: SpaceFrontendModule['update'] = ({ model, msgSpace: msgSpace, ctx }) => {
  switch (msgSpace?.t) {
    case 'user-left-space': {
      if (!ctx.currentUserId) {
        return {
          model,
        }
      }

      const currentUserSpaceId = SpacesSpaceFrontend.toSpaceIdByUserId(model, ctx.currentUserId)

      if (msgSpace.spaceId !== currentUserSpaceId) {
        return {
          model,
        }
      }

      if (msgSpace.userId !== ctx.currentUserId) {
        const username = ctx.profiles[msgSpace.userId]?.username
        return {
          model,
          msgCmd: [
            playSound(APP_SOUND.navBackward),
            username
              ? showToast(ctx.t('spaces.other-user-left', username))
              : showToast(ctx.t('spaces.current-user-left')),
          ],
        }
      }

      return {
        model,
        msgCmd: [
          playSound(APP_SOUND.navBackward),
          showToast(ctx.t('spaces.current-user-left')),
          pushScreen({
            n: 'spaces',
            t: 'space-list',
          }),
        ],
      }
    }
    default: {
      return {
        model,
      }
    }
  }
}

const updateLeaveSpaceButton: SpaceFrontendModule['update'] = ({ ctx, model, msg }) => {
  switch (msg?.t) {
    case 'clicked-leave-space-button': {
      if (!ctx.currentUserId) {
        return {
          model,
        }
      }

      const currentUserSpaceId = SpacesSpaceFrontend.toSpaceIdByUserId(model, ctx.currentUserId)

      if (!currentUserSpaceId) {
        return {
          model,
        }
      }

      const spaceEventNew = withEventId<SpaceEvent>({
        t: 'user-left-space',
        spaceId: currentUserSpaceId,
        userId: ctx.currentUserId,
      })

      return {
        model,
        msgSpace: [spaceEventNew],
      }
    }

    default: {
      return {
        model,
      }
    }
  }
}

const ViewLeaveSpaceButton: SpaceFrontendModule['View'] = (input) => {
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
          spaceId: userSpaceId,
        })
      }
    />
  )
}

export const LeaveSpaceFrontend = {
  update,
  ViewLeaveSpaceButton,
}
