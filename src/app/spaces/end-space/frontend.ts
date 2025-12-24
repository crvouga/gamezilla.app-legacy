import { Eff } from '~/@/eff'
import { withEventId } from '~/@/event-sourced/event'
import { Sub } from '~/@/sub'
import { IconArrowLeftOnRect } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { andThen } from '~/app/@/frontend/and-then'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd.$msg'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { ScreenTitleButton } from '~/app/@/ui/screen/title-button/screen-title-button'
import { replaceScreen } from '~/app/frontend/current-screen/current-screen-cmd'
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
    case 'clickedEndSpaceButton': {
      if (!input.ctx.currentUser?.userId) return input

      const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

      if (!currentUserSpace) return input

      const currentUserSpaceId = Space.toSpaceId(currentUserSpace)

      if (!currentUserSpaceId) return input

      const currentUserId = input.ctx.currentUser?.userId

      if (!currentUserId) return input

      return {
        model: input.model,
        eff: async () => {
          spaceMsgs.pub(
            withEventId<MsgSpace>({
              t: 'userEndedSpace',
              spaceId: currentUserSpaceId,
              userId: currentUserId,
            }),
          )
        },
      }
    }
    case 'submittedEndSpaceForm': {
      return input
    }
    case 'clickedBackButton': {
      return {
        model: input.model,
        eff: replaceScreen({ n: 'spaces', t: 'spaces_list' }, true),
      }
    }
    case 'gotMsgSpace': {
      const msgSpace = input.msg.c

      switch (msgSpace.t) {
        case 'userEndedSpace': {
          if (!input.ctx.currentUser?.userId) return input

          const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

          if (!currentUserSpace) return input

          const currentUserSpaceId = Space.toSpaceId(currentUserSpace)

          if (!currentUserSpaceId) return input

          if (msgSpace.spaceId !== currentUserSpaceId) return input

          return andThen(
            input,
            (model) => updatePlaySound({ ...input, model }),
            (model) => updatePushScreen({ ...input, model }),
            (model) => updateShowToast({ ...input, model }),
          )
        }
        default: {
          return input
        }
      }
    }
  }
}

const updatePlaySound: typeof update = (input) => {
  return {
    model: input.model,
    msgOut: [PlaySoundCmd.init(APP_SOUND.navBackward)],
  }
}

const updatePushScreen: typeof update = (input) => {
  if (input.msg.t !== 'gotMsgSpace') return input

  const msgSpace = input.msg.c

  if (msgSpace?.t !== 'userEndedSpace') return input

  if (input.ctx.currentScreen.t === 'spaces_space' && input.ctx.currentScreen.spaceId === msgSpace?.spaceId) {
    return { model: input.model, msgOut: [PushScreenCmd.init({ n: 'spaces', t: 'spaces_list' })] }
  }

  return { model: input.model, msgOut: [] }
}

const updateShowToast: typeof update = (input) => {
  if (input.msg.t !== 'gotMsgSpace') return input

  const msgSpace = input.msg.c

  if (msgSpace?.t !== 'userEndedSpace') return input

  if (msgSpace?.userId === input.ctx.currentUser?.userId) {
    return { model: input.model, msgOut: [ShowToastCmd.init(input.ctx.t('spaces.ended-space-current-user'))] }
  }
  const { userId } = msgSpace

  const profile = input.ctx.profilesByUserId[userId]

  if (!profile) {
    return { model: input.model, msgOut: [ShowToastCmd.init(input.ctx.t('spaces.ended-space-host'))] }
  }

  return {
    model: input.model,
    msgOut: [ShowToastCmd.init(input.ctx.t('spaces.ended-space-other-user', profile.username))],
  }
}

export const viewAction = (input: { ctx: FrontendCtxModule; dispatch: (msg: Msg) => void }): ScreenAction | null => {
  if (!input.ctx.currentUser?.userId) return null

  const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

  if (!currentUserSpace) return null

  const currentUserSpaceId = Space.toSpaceId(currentUserSpace)

  if (!currentUserSpaceId) return null

  return {
    id: input.ctx.t('spaces.end'),
    renderIcon: (iconProps) => h(IconArrowLeftOnRect, iconProps),
    label: input.ctx.t('spaces.end'),
    onPress: () => input.dispatch({ n: 'endSpace', t: 'clickedEndSpaceButton', spaceId: currentUserSpaceId }),
    color: 'danger',
  }
}

export const ViewSpaceEnded = (input: {
  ctx: FrontendCtxModule
  dispatch: (msg: Msg) => void
  model: ModelFrontend
}) => {
  return h(ScreenTitleButton, {
    title: input.ctx.t('spaces.space-ended'),
    buttonText: input.ctx.t('spaces.exit-space'),
    onPress: () => input.dispatch({ n: 'endSpace', t: 'clickedBackButton' }),
  })
}

const endSpaceMsgs = Sub.where(spaceMsgs, (msg) => msg.t === 'userEndedSpace')

export const subscriptions = (_input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<Msg> => {
  return Sub.map(endSpaceMsgs, (c): Msg => ({ n: 'endSpace', t: 'gotMsgSpace', c }))
}
