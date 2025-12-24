import { Eff } from '~/@/eff'
import { withEventMeta } from '~/@/event-sourced/event'
import { IconArrowLeftOnRect } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { pushScreen } from '~/app/frontend/current-screen/current-screen-cmd'
import { playSound } from '~/app/@/frontend/sound-cmd'
import { showToast } from '~/app/@/frontend/toaster-cmd'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { CurrentUserSpaceLoader } from '../space/current-user-space-loader'
import { MsgSpace, spaceMsgs } from '../space/msg-space'
import { Space } from '../space/space'
import type { FrontendCtxModule, ModelFrontend } from '../base-types'
import { Msg } from './types'

export const update = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  msg: Msg
}): {
  model: ModelFrontend
  eff?: Eff<Msg>
} => {
  switch (input.msg.t) {
    case 'leaveSpace_clickedLeaveSpaceButton': {
      if (!input.ctx.currentUser?.userId) return input

      const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

      if (!currentUserSpace) return input

      const currentUserSpaceId = Space.toSpaceId(currentUserSpace)

      if (!currentUserSpaceId) return input

      const spaceEventNew = withEventMeta<MsgSpace>({
        t: 'userLeftSpace',
        spaceId: currentUserSpaceId,
        userId: input.ctx.currentUser.userId,
      })

      return {
        model: input.model,
        eff: () => {
          spaceMsgs.pub(spaceEventNew)
        },
      }
    }

    case 'leaveSpace_gotMsgSpace': {
      const msgSpace = input.msg.c
      switch (msgSpace.t) {
        case 'userLeftSpace': {
          if (!input.ctx.currentUser?.userId) return input

          const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

          if (!currentUserSpace) return input

          const currentUserSpaceId = Space.toSpaceId(currentUserSpace)

          if (msgSpace.spaceId !== currentUserSpaceId) return input

          if (msgSpace.userId !== input.ctx.currentUser?.userId) {
            const username = input.ctx.profilesByUserId[msgSpace.userId]?.username
            return {
              model: input.model,
              eff: Eff.batch([
                playSound(APP_SOUND.navBackward),
                username
                  ? showToast(input.ctx.t('spaces.other-user-left', username))
                  : showToast(input.ctx.t('spaces.current-user-left')),
              ]),
            }
          }

          return {
            model: input.model,
            eff: Eff.batch([
              playSound(APP_SOUND.navBackward),
              showToast(input.ctx.t('spaces.current-user-left')),
              pushScreen({ n: 'spaces', t: 'spaces_list' }),
            ]),
          }
        }
        default: {
          return input
        }
      }
    }
  }
  return input
}

const viewAction = (input: { ctx: FrontendCtxModule; dispatch: (msg: Msg) => void }): ScreenAction | null => {
  if (!input.ctx.currentUser?.userId) return null

  const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

  if (!currentUserSpace) return null

  const spaceId = Space.toSpaceId(currentUserSpace)

  if (!spaceId) return null

  return {
    id: input.ctx.t('spaces.leave'),
    renderIcon: (inputIcon) => h(IconArrowLeftOnRect, inputIcon),
    label: input.ctx.t('spaces.leave'),
    onPress: () => input.dispatch({ t: 'leaveSpace_clickedLeaveSpaceButton', spaceId }),
    color: 'danger',
  }
}

export const LeaveSpaceFrontend = {
  update,
  viewAction,
}
