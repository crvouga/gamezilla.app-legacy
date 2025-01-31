import { withEventId } from '~/@/event-sourced/event'
import { IconArrowLeftOnRect } from '~/@/ui'
import { APP_SOUND, playSound, pushScreen, showToast } from '~/app/@/frontend/cmd'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { ScreenTitleButton } from '~/app/@/ui/screen/title-button/screen-title-button'
import { SpaceFrontendModule } from '../@/architecture/space-frontend'
import { SpacesCore } from '../core/core'
import type { MsgSpace } from '../core/space-msg'

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
      if (!input.ctx.currentUserId) return { model: input.model }
      const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(input.model.spaces, input.ctx.currentUserId)
      if (!currentUserSpaceId) return { model: input.model }

      return {
        model: input.model,
        msgSpace: [
          withEventId({ t: 'user-ended-space', spaceId: currentUserSpaceId, userId: input.ctx.currentUserId }),
        ],
      }
    }
  }
  return { model: input.model }
}

const updateFromMsgSpace: SpaceFrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-ended-space': {
      if (!input.ctx.currentUserId) return { model: input.model }
      const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(input.model.spaces, input.ctx.currentUserId)
      const msgSpace = input.msgSpace
      if (msgSpace.spaceId !== currentUserSpaceId) return { model: input.model }

      return SpaceFrontendModule.andThen(
        { model: input.model },
        (model) => ({ model, msgCmd: [playSound(APP_SOUND.navBackward)] }),
        (model) => {
          if (input.ctx.currentScreen.t === 'space' && input.ctx.currentScreen.spaceId === msgSpace.spaceId) {
            return { model, msgCmd: [pushScreen({ n: 'spaces', t: 'space-list' })] }
          }
          return { model, msgCmd: [] }
        },
        (model) => {
          if (msgSpace.userId === input.ctx.currentUserId) {
            return { model, msgCmd: [showToast(input.ctx.t('spaces.ended-space-current-user'))] }
          }
          const profile = input.ctx.profiles[msgSpace.userId]
          if (!profile) {
            return { model, msgCmd: [showToast(input.ctx.t('spaces.ended-space-host'))] }
          }
          return { model, msgCmd: [showToast(input.ctx.t('spaces.ended-space-other-user', profile.username))] }
        },
      )
    }
  }
  return { model: input.model }
}

const updateEndSpaceButton: SpaceFrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'clicked-end-space-button': {
      if (!input.ctx.currentUserId) return { model: input.model }
      const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(input.model.spaces, input.ctx.currentUserId)
      if (!currentUserSpaceId) return { model: input.model }

      return {
        model: input.model,
        msgSpace: [
          withEventId<MsgSpace>({
            t: 'user-ended-space',
            spaceId: currentUserSpaceId,
            userId: input.ctx.currentUserId,
          }),
        ],
      }
    }
    default:
      return { model: input.model }
  }
}

const viewAction = (input: Parameters<SpaceFrontendModule['View']>[0]): ScreenAction | null => {
  const spaceId = SpacesCore.toSpaceIdByUserId(input.model.spaces, input.ctx.currentUserId)
  if (!spaceId) return null

  return {
    icon: (inputIcon) => <IconArrowLeftOnRect {...inputIcon} />,
    label: input.ctx.t('spaces.end'),
    onClick: () => input.dispatch({ t: 'clicked-end-space-button', spaceId }),
    color: 'danger',
  }
}

const ViewSpaceEnded: SpaceFrontendModule['View'] = (input) => {
  return (
    <ScreenTitleButton
      title={input.ctx.t('spaces.space-ended')}
      buttonText={input.ctx.t('spaces.exit-space')}
      onClick={() => input.dispatch({ t: 'clicked-exit-space-button' })}
    />
  )
}

export const EndSpaceFrontend = {
  ViewSpaceEnded,
  update,
  viewAction,
}
