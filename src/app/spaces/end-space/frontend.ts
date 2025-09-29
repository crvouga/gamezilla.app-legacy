import { Eff } from '~/@/eff'
import { withEventId } from '~/@/event-sourced/event'
import { IconArrowLeftOnRect } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { andThen } from '~/app/@/frontend/and-then'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { CurrentUserLoggedOutEvt } from '~/app/@/frontend/current-user-logged-out-evt.$msg'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ReplaceScreenCmd } from '~/app/@/frontend/replace-screen-cmd.$msg'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd.$msg'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { ScreenTitleButton } from '~/app/@/ui/screen/title-button/screen-title-button'
import { GotSpaceMsg } from '../@/got-space-msg.$msg'
import { CurrentUserSpaceLoader } from '../space/current-user-space-loader'
import { MsgSpace } from '../space/msg-space'
import { Space } from '../space/space'
import { FrontendCtxModule, ModelFrontend } from '../types'
import { isMsgFrontend, MsgFrontend } from './types'

const update = <T extends ModelFrontend>(input: {
  ctx: FrontendCtxModule
  model: T
  msg?: unknown
  msgIn?: unknown
}): {
  model: T
  msgOut?: unknown[]
  eff?: Eff<MsgFrontend>
} => {
  return andThen<T, MsgFrontend>(
    input,
    (model) => updateEndSpaceButton({ ...input, model }),
    (model) => updateFromMsgSpace({ ...input, model }),
    (model) => updateFromAppEvent({ ...input, model }),
  )
}

const updateFromAppEvent: typeof update = (input) => {
  if (CurrentUserLoggedOutEvt.is(input.msgIn)) {
    if (!input.ctx.currentUser?.userId) return input

    const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

    if (!currentUserSpace) return input

    const currentUserSpaceId = Space.toSpaceId(currentUserSpace)

    if (!currentUserSpaceId) return input

    return {
      model: input.model,
      msgSpace: [
        withEventId({ t: 'user-ended-space', spaceId: currentUserSpaceId, userId: input.ctx.currentUser.userId }),
      ],
    }
  }

  return input
}

const updateFromMsgSpace: typeof update = (input) => {
  if (!GotSpaceMsg.is(input.msgIn)) return input

  const msgSpace = input.msgIn.c

  switch (msgSpace?.t) {
    case 'user-ended-space': {
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
  }
  return input
}

const updatePlaySound: typeof update = (input) => {
  return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.navBackward)] }
}

const updatePushScreen: typeof update = (input) => {
  if (!GotSpaceMsg.is(input.msgIn)) return input

  const msgSpace = input.msgIn.c

  if (input.ctx.currentScreen.t === 'spaces_space' && input.ctx.currentScreen.spaceId === msgSpace?.spaceId) {
    return { model: input.model, msgOut: [PushScreenCmd.init({ n: 'spaces', t: 'spaces_list' })] }
  }

  return { model: input.model, msgOut: [] }
}

const updateShowToast: typeof update = (input) => {
  if (!GotSpaceMsg.is(input.msgIn)) return input

  const msgSpace = input.msgIn.c

  if (msgSpace?.t !== 'user-ended-space') return input

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

const updateEndSpaceButton: typeof update = (input) => {
  if (!isMsgFrontend(input.msg)) return input

  switch (input.msg.t) {
    case 'endSpace_clickedEndSpaceButton': {
      if (!input.ctx.currentUser?.userId) return input

      const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

      if (!currentUserSpace) return input

      const currentUserSpaceId = Space.toSpaceId(currentUserSpace)

      if (!currentUserSpaceId) return input

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
    case 'endSpace_submittedEndSpaceForm': {
      return input
    }
    case 'endSpace_clickedBackButton': {
      return {
        model: input.model,
        msgOut: [ReplaceScreenCmd.init({ n: 'spaces', t: 'spaces_list' }, true)],
      }
    }
  }
}

const viewAction = (input: { ctx: FrontendCtxModule; dispatch: (msg: MsgFrontend) => void }): ScreenAction | null => {
  if (!input.ctx.currentUser?.userId) return null

  const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

  if (!currentUserSpace) return null

  const currentUserSpaceId = Space.toSpaceId(currentUserSpace)

  if (!currentUserSpaceId) return null

  return {
    id: input.ctx.t('spaces.end'),
    renderIcon: (iconProps) => h(IconArrowLeftOnRect, iconProps),
    label: input.ctx.t('spaces.end'),
    onPress: () => input.dispatch({ t: 'endSpace_clickedEndSpaceButton', spaceId: currentUserSpaceId }),
    color: 'danger',
  }
}

const ViewSpaceEnded = (input: { ctx: FrontendCtxModule; dispatch: (msg: MsgFrontend) => void }) => {
  return h(ScreenTitleButton, {
    title: input.ctx.t('spaces.space-ended'),
    buttonText: input.ctx.t('spaces.exit-space'),
    onPress: () => input.dispatch({ t: 'endSpace_clickedBackButton' }),
  })
}

export const EndSpaceFrontend = {
  ViewSpaceEnded,
  update,
  viewAction,
}
