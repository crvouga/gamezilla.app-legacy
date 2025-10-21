import { Eff } from '~/@/eff'
import { withEventMeta } from '~/@/event-sourced/event'
import { IconArrowLeftOnRect } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { andThen } from '~/app/@/frontend/and-then'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd.$msg'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { GotSpaceMsg } from '../@/got-space-msg.$msg'
import { CurrentUserSpaceLoader } from '../space/current-user-space-loader'
import { MsgSpace } from '../space/msg-space'
import { Space } from '../space/space'
import { FrontendCtxModule, ModelFrontend } from '../types'
import { SpaceId } from '~/app/@/data/space-id'

export type Msg =
  | { t: 'leaveSpace_clickedLeaveSpaceButton'; spaceId: SpaceId }
  | { t: 'leaveSpace_submittedLeaveSpaceButton'; spaceId: SpaceId }

const update = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  msg: Msg
}): {
  model: ModelFrontend
  eff?: Eff<Msg>
} => {
  return andThen(
    input,
    (model) => updateFromMsgSpace({ ...input, model }),
    (model) => updateLeaveSpaceButton({ ...input, model }),
  )
}

const updateFromMsgSpace: typeof update = (input) => {
  if (!GotSpaceMsg.is(input.msgIn)) return input
  const msgSpace = input.msgIn.c

  switch (msgSpace?.t) {
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
            t: 'spaces_list',
          }),
        ],
      }
    }
  }
  return input
}

const updateLeaveSpaceButton: typeof update = (input) => {
  if (!isMsgFrontend(input.msg)) return input

  switch (input.msg?.t) {
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
        msgOut: [GotSpaceMsg.init(spaceEventNew)],
      }
    }

    default: {
      return input
    }
  }
}

const viewAction = (input: { ctx: FrontendCtxModule; dispatch: (msg: MsgFrontend) => void }): ScreenAction | null => {
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
