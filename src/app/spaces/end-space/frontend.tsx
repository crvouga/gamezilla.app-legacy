import { withEventId } from '~/@/event-sourced/event'
import { IconArrowLeftOnRect } from '~/@/ui'
import { APP_SOUND, playSound, pushScreen, showToast } from '~/app/@/frontend/cmd'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { ScreenTitleButton } from '~/app/@/ui/screen/title-button/screen-title-button'
import { SpaceFrontendModule } from '../architecture/space-frontend'
import { SpacesCore } from '../core/core'
import { MsgSpace } from '../core/space-msg/space-msg'

const update: SpaceFrontendModule['update'] = (input) => {
  return SpaceFrontendModule.andThen(
    { model: input.model },
    (model) => updateEndSpaceButton({ ...input, model }),
    (model) => updateFromMsgSpace({ ...input, model }),
    (model) => updateFromAppEvent({ ...input, model }),
  )
}

const updateFromAppEvent: SpaceFrontendModule['update'] = (input) => {
  switch (input.msgEvt?.t) {
    case 'auth-evt.unauthenticated': {
      if (!input.ctx.currentUser?.userId) return { model: input.model }

      const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(input.model.spaces, input.ctx.currentUser.userId)

      if (!currentUserSpaceId) return { model: input.model }

      return {
        model: input.model,
        msgSpace: [
          withEventId({ t: 'user-ended-space', spaceId: currentUserSpaceId, userId: input.ctx.currentUser.userId }),
        ],
      }
    }
  }
  return { model: input.model }
}

const updateFromMsgSpace: SpaceFrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-ended-space': {
      if (!input.ctx.currentUser?.userId) return { model: input.model }

      const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(input.model.spaces, input.ctx.currentUser?.userId)

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
  return { model: input.model, msgCmd: [playSound(APP_SOUND.navBackward)] }
}

const updatePushScreen: SpaceFrontendModule['update'] = (input) => {
  if (input.ctx.currentScreen.t === 'space' && input.ctx.currentScreen.spaceId === input.msgSpace?.spaceId) {
    return { model: input.model, msgCmd: [pushScreen({ n: 'spaces', t: 'space-list' })] }
  }

  return { model: input.model, msgCmd: [] }
}

const updateShowToast: SpaceFrontendModule['update'] = (input) => {
  if (input.msgSpace?.t !== 'user-ended-space') return { model: input.model }

  if (input.msgSpace?.userId === input.ctx.currentUser?.userId) {
    return { model: input.model, msgCmd: [showToast(input.ctx.t('spaces.ended-space-current-user'))] }
  }

  const profile = input.ctx.profiles[input.msgSpace.userId]

  if (!profile) {
    return { model: input.model, msgCmd: [showToast(input.ctx.t('spaces.ended-space-host'))] }
  }

  return { model: input.model, msgCmd: [showToast(input.ctx.t('spaces.ended-space-other-user', profile.username))] }
}

const updateEndSpaceButton: SpaceFrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'end-space.clicked-end-space-button': {
      if (!input.ctx.currentUser?.userId) return { model: input.model }

      const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(input.model.spaces, input.ctx.currentUser.userId)

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
  const spaceId = SpacesCore.toSpaceIdByUserId(input.model.spaces, input.ctx.currentUser?.userId)

  if (!spaceId) return null

  return {
    id: input.ctx.t('spaces.end'),
    icon: (inputIcon) => <IconArrowLeftOnRect {...inputIcon} />,
    label: input.ctx.t('spaces.end'),
    onClick: () => input.dispatch({ t: 'end-space.clicked-end-space-button', spaceId }),
    color: 'danger',
  }
}

const ViewSpaceEnded: SpaceFrontendModule['View'] = (input) => {
  return (
    <ScreenTitleButton
      title={input.ctx.t('spaces.space-ended')}
      buttonText={input.ctx.t('spaces.exit-space')}
      onClick={() => input.dispatch({ t: 'exit-space-action.clicked-exit-space-button' })}
    />
  )
}

export const EndSpaceFrontend = {
  ViewSpaceEnded,
  update,
  viewAction,
}
