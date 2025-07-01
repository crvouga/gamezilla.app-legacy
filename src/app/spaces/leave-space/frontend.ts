import { withEventId } from '~/@/event-sourced/event'
import { IconArrowLeftOnRect } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd.$msg'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { SpaceFrontendModule } from '../frontend/space-frontend'
import { MsgSpace } from '../space/msg-space'
import { Spaces } from '../space/spaces'

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
      if (!ctx.currentUser?.userId) return { model }

      const currentUserSpaceId = Spaces.toSpaceIdByUserId(model.spaces, ctx.currentUser?.userId)

      if (msgSpace.spaceId !== currentUserSpaceId) return { model }

      if (msgSpace.userId !== ctx.currentUser?.userId) {
        const username = ctx.profilesByUserId[msgSpace.userId]?.username
        return {
          model,
          msgOut: [
            PlaySoundCmd.init(APP_SOUND.navBackward),
            username
              ? ShowToastCmd.init(ctx.t('spaces.other-user-left', username))
              : ShowToastCmd.init(ctx.t('spaces.current-user-left')),
          ],
        }
      }

      return {
        model,
        msgOut: [
          PlaySoundCmd.init(APP_SOUND.navBackward),
          ShowToastCmd.init(ctx.t('spaces.current-user-left')),
          PushScreenCmd.init({
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
    case 'leave-space.clicked-leave-space-button': {
      if (!ctx.currentUser?.userId) return { model }

      const currentUserSpaceId = Spaces.toSpaceIdByUserId(model.spaces, ctx.currentUser.userId)

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
  const spaceId = Spaces.toSpaceIdByUserId(input.model.spaces, input.ctx.currentUser?.userId)
  if (!spaceId) return null
  return {
    id: input.ctx.t('spaces.leave'),
    icon: (inputIcon) => h(IconArrowLeftOnRect, inputIcon),
    label: input.ctx.t('spaces.leave'),
    onClick: () => input.dispatch({ t: 'leave-space.clicked-leave-space-button', spaceId }),
    color: 'danger',
  }
}

export const LeaveSpaceFrontend = {
  update,
  viewAction,
}
