import { withEventId } from '~/@/event-sourced/event'
import { IconPlus } from '~/@/ui/icon/icon-plus'
import { SpaceId } from '~/app/@/data/space-id'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd'
import { PostActionProps } from '~/app/@/ui/screen/layout/screen-layout-props'
import { SpaceFrontendModule } from '../frontend/space-frontend-module'
import { MsgSpace } from '../space/space-msg'

const update: SpaceFrontendModule['update'] = (input) => {
  return SpaceFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromMsgSpace({ ...input, model }),
    (model) => updateStartSpaceButton({ ...input, model }),
  )
}

const updateFromMsgSpace: SpaceFrontendModule['update'] = ({ model, msgSpace: msgSpace, ctx }) => {
  switch (msgSpace?.t) {
    case 'user-started-space': {
      if (msgSpace.userId === ctx.currentUser?.userId) {
        return {
          model,
          msgOut: [
            PushScreenCmd.init({ n: 'spaces', t: 'space', spaceId: msgSpace.spaceId }),
            PlaySoundCmd.init(APP_SOUND.navForward),
            ShowToastCmd.init(ctx.t('spaces.space-started')),
          ],
        }
      }

      return {
        model,
      }
    }
    default: {
      return {
        model,
      }
    }
  }
}

const updateStartSpaceButton: SpaceFrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'start-space.clicked-start-space-button': {
      if (!input.ctx.currentUser?.userId) {
        return {
          model: input.model,
        }
      }

      const spaceEventNew = withEventId<MsgSpace>({
        t: 'user-started-space',
        spaceId: input.msg.spaceId,
        userId: input.ctx.currentUser.userId,
      })

      return {
        model: input.model,
        msgSpace: [spaceEventNew],
      }
    }
    default: {
      return {
        model: input.model,
      }
    }
  }
}

export const viewStartSpaceButton = (input: Parameters<SpaceFrontendModule['View']>[0]): PostActionProps | null => {
  if (!input.ctx.currentUser?.userId) return null

  const currentUserSpaceId = input.model.spaces.indexSpaceIdByUserId[input.ctx.currentUser.userId]

  if (currentUserSpaceId) return null

  return {
    onSubmit: () => input.dispatch({ t: 'start-space.clicked-start-space-button', spaceId: SpaceId.generate() }),
    submitText: input.ctx.t('spaces.start-space'),
    submitIcon: (iconInput) => <IconPlus {...iconInput} />,
    submitDisabled: false,
    submitLoading: false,
  }
}

export const StartSpaceFrontend = {
  viewStartSpaceButton,
  update,
}
