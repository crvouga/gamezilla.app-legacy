import { withEventId } from '~/@/event-sourced/event'
import { IconArrowLeftOnRect } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd.$msg'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { SpaceFrontendModule } from '../frontend/space-frontend'
import { CurrentUserSpaceLoader } from '../space/current-user-space-loader'
import { MsgSpace } from '../space/msg-space'
import { Space } from '../space/space'

const update: SpaceFrontendModule['update'] = (input) => {
  return SpaceFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromMsgSpace({ ...input, model }),
    (model) => updateLeaveSpaceButton({ ...input, model }),
  )
}

const updateFromMsgSpace: SpaceFrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-left-space': {
      if (!input.ctx.currentUser?.userId) return { model: input.model }

      const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

      if (!currentUserSpace) return { model: input.model }

      const currentUserSpaceId = Space.toSpaceId(currentUserSpace)

      if (input.msgSpace.spaceId !== currentUserSpaceId) return { model: input.model }

      if (input.msgSpace.userId !== input.ctx.currentUser?.userId) {
        const username = input.ctx.profilesByUserId[input.msgSpace.userId]?.username
        return {
          model: input.model,
          msgOut: [
            PlaySoundCmd.init(APP_SOUND.navBackward),
            username
              ? ShowToastCmd.init(input.ctx.t('spaces.other-user-left', username))
              : ShowToastCmd.init(input.ctx.t('spaces.current-user-left')),
          ],
        }
      }

      return {
        model: input.model,
        msgOut: [
          PlaySoundCmd.init(APP_SOUND.navBackward),
          ShowToastCmd.init(input.ctx.t('spaces.current-user-left')),
          PushScreenCmd.init({
            n: 'spaces',
            t: 'space-list',
          }),
        ],
      }
    }
  }
  return { model: input.model }
}

const updateLeaveSpaceButton: SpaceFrontendModule['update'] = ({ ctx, model, msg }) => {
  switch (msg?.t) {
    case 'leave-space.clicked-leave-space-button': {
      if (!ctx.currentUser?.userId) return { model }

      const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(ctx)

      if (!currentUserSpace) return { model }

      const currentUserSpaceId = Space.toSpaceId(currentUserSpace)

      if (!currentUserSpaceId) return { model }

      const spaceEventNew = withEventId<MsgSpace>({
        t: 'user-left-space',
        spaceId: currentUserSpaceId,
        userId: ctx.currentUser.userId,
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
  if (!input.ctx.currentUser?.userId) return null

  const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

  if (!currentUserSpace) return null

  const spaceId = Space.toSpaceId(currentUserSpace)

  if (!spaceId) return null

  return {
    id: input.ctx.t('spaces.leave'),
    renderIcon: (inputIcon) => h(IconArrowLeftOnRect, inputIcon),
    label: input.ctx.t('spaces.leave'),
    onPress: () => input.dispatch({ t: 'leave-space.clicked-leave-space-button', spaceId }),
    color: 'danger',
  }
}

export const LeaveSpaceFrontend = {
  update,
  viewAction,
}
