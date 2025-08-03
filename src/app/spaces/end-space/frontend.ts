import { withEventId } from '~/@/event-sourced/event'
import { IconArrowLeftOnRect } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { CurrentUserLoggedOutEvt } from '~/app/@/frontend/current-user-logged-out-evt.$msg'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd.$msg'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { ScreenTitleButton } from '~/app/@/ui/screen/title-button/screen-title-button'
import { SpaceFrontendModule } from '../frontend/space-frontend'
import { CurrentUserSpaceLoader } from '../space/current-user-space-loader'
import { MsgSpace } from '../space/msg-space'
import { Space } from '../space/space'

const update: SpaceFrontendModule['update'] = (input) => {
  return SpaceFrontendModule.andThen(
    { model: input.model },
    (model) => updateEndSpaceButton({ ...input, model }),
    (model) => updateFromMsgSpace({ ...input, model }),
    (model) => updateFromAppEvent({ ...input, model }),
  )
}

const updateFromAppEvent: SpaceFrontendModule['update'] = (input) => {
  if (CurrentUserLoggedOutEvt.is(input.msgIn)) {
    if (!input.ctx.currentUser?.userId) return { model: input.model }

    const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

    if (!currentUserSpace) return { model: input.model }

    const currentUserSpaceId = Space.toSpaceId(currentUserSpace)

    if (!currentUserSpaceId) return { model: input.model }

    return {
      model: input.model,
      msgSpace: [
        withEventId({ t: 'user-ended-space', spaceId: currentUserSpaceId, userId: input.ctx.currentUser.userId }),
      ],
    }
  }

  return { model: input.model }
}

const updateFromMsgSpace: SpaceFrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-ended-space': {
      if (!input.ctx.currentUser?.userId) return { model: input.model }

      const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

      if (!currentUserSpace) return { model: input.model }

      const currentUserSpaceId = Space.toSpaceId(currentUserSpace)

      if (!currentUserSpaceId) return { model: input.model }

      const msgSpace = input.msgSpace

      if (msgSpace.spaceId !== currentUserSpaceId) return { model: input.model }

      return SpaceFrontendModule.andThen(
        { model: input.model },
        (model) => updatePlaySound({ ...input, model }),
        (model) => updatePushScreen({ ...input, model }),
        (model) => updateShowToast({ ...input, model }),
      )
    }
  }
  return { model: input.model }
}

const updatePlaySound: SpaceFrontendModule['update'] = (input) => {
  return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.navBackward)] }
}

const updatePushScreen: SpaceFrontendModule['update'] = (input) => {
  if (input.ctx.currentScreen.t === 'space' && input.ctx.currentScreen.spaceId === input.msgSpace?.spaceId) {
    return { model: input.model, msgOut: [PushScreenCmd.init({ n: 'spaces', t: 'space-list' })] }
  }

  return { model: input.model, msgOut: [] }
}

const updateShowToast: SpaceFrontendModule['update'] = (input) => {
  if (input.msgSpace?.t !== 'user-ended-space') return { model: input.model }

  if (input.msgSpace?.userId === input.ctx.currentUser?.userId) {
    return { model: input.model, msgOut: [ShowToastCmd.init(input.ctx.t('spaces.ended-space-current-user'))] }
  }
  const { userId } = input.msgSpace

  const profile = input.ctx.profilesByUserId[userId]

  if (!profile) {
    return { model: input.model, msgOut: [ShowToastCmd.init(input.ctx.t('spaces.ended-space-host'))] }
  }

  return {
    model: input.model,
    msgOut: [ShowToastCmd.init(input.ctx.t('spaces.ended-space-other-user', profile.username))],
  }
}

const updateEndSpaceButton: SpaceFrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'end-space.clicked-end-space-button': {
      if (!input.ctx.currentUser?.userId) return { model: input.model }

      const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

      if (!currentUserSpace) return { model: input.model }

      const currentUserSpaceId = Space.toSpaceId(currentUserSpace)

      if (!currentUserSpaceId) return { model: input.model }

      return {
        model: input.model,
        msgSpace: [
          withEventId<MsgSpace>({
            t: 'user-ended-space',
            spaceId: currentUserSpaceId,
            userId: input.ctx.currentUser.userId,
          }),
        ],
      }
    }
    default:
      return { model: input.model }
  }
}

const viewAction = (input: Parameters<SpaceFrontendModule['View']>[0]): ScreenAction | null => {
  if (!input.ctx.currentUser?.userId) return null

  const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

  if (!currentUserSpace) return null

  const currentUserSpaceId = Space.toSpaceId(currentUserSpace)

  if (!currentUserSpaceId) return null

  return {
    id: input.ctx.t('spaces.end'),
    renderIcon: (iconProps) => h(IconArrowLeftOnRect, iconProps),
    label: input.ctx.t('spaces.end'),
    onPress: () => input.dispatch({ t: 'end-space.clicked-end-space-button', spaceId: currentUserSpaceId }),
    color: 'danger',
  }
}

const ViewSpaceEnded: SpaceFrontendModule['View'] = (input) => {
  return h(ScreenTitleButton, {
    title: input.ctx.t('spaces.space-ended'),
    buttonText: input.ctx.t('spaces.exit-space'),
    onPress: () => input.dispatch({ t: 'exit-space-action.clicked-exit-space-button' }),
  })
}

export const EndSpaceFrontend = {
  ViewSpaceEnded,
  update,
  viewAction,
}
