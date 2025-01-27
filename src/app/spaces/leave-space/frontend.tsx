import { withEventId } from '~/@/event-sourced/event'
import { IconArrowRightOnRect } from '~/@/ui/icon/icon-arrow-right-on-rect'
import { APP_SOUND, playSound, pushScreen, showToast } from '~/app/@/frontend/cmd'
import { ScreenAction } from '~/app/@/screen/screen-actions'
import { SpaceFrontendModule } from '../@/architecture/space-frontend'
import { SpacesCore } from '../core/core'
import type { MsgSpace } from '../core/space-msg'

const update: SpaceFrontendModule['update'] = (input) => {
  return SpaceFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromMsgSpace({ ...input, model }),
    (model) => updateLeaveSpaceButton({ ...input, model }),
  )
}

const updateFromMsgSpace: SpaceFrontendModule['update'] = ({ model, msgSpace: msgSpace, ctx }) => {
  switch (msgSpace?.t) {
    case 'user-left-space': {
      if (!ctx.currentUserId) return { model }

      const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(model, ctx.currentUserId)

      if (msgSpace.spaceId !== currentUserSpaceId) return { model }

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
  }
  return { model }
}

const updateLeaveSpaceButton: SpaceFrontendModule['update'] = ({ ctx, model, msg }) => {
  switch (msg?.t) {
    case 'clicked-leave-space-button': {
      if (!ctx.currentUserId) {
        return {
          model,
        }
      }

      const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(model, ctx.currentUserId)

      if (!currentUserSpaceId) {
        return {
          model,
        }
      }

      const spaceEventNew = withEventId<MsgSpace>({
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

const viewAction = (input: Parameters<SpaceFrontendModule['View']>[0]): ScreenAction | null => {
  const spaceId = SpacesCore.toSpaceIdByUserId(input.model, input.ctx.currentUserId)
  if (!spaceId) return null
  return {
    icon: (inputIcon) => <IconArrowRightOnRect {...inputIcon} />,
    label: input.ctx.t('spaces.leave'),
    onClick: () => input.dispatch({ t: 'clicked-leave-space-button', spaceId }),
    color: 'danger',
  }
}

export const LeaveSpaceFrontend = {
  update,
  viewAction,
}
