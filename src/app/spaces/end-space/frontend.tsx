import { withEventId } from '~/@/event-sourced/event'
import { APP_SOUND, playSound, pushScreen, showToast } from '~/app/@/frontend/cmd'
import { Button, Typography } from '~/@/ui'
import { SpaceFrontendModule } from '../@/architecture/space-frontend'
import { SpacesCore } from '../core/core'
import type { MsgSpace } from '../core/space-msg'
import { IconArrowRightOnRect } from '~/@/ui/icon/icon-arrow-right-on-rect'
import { ScreenAction } from '~/app/@/ui/screen-actions'

const update: SpaceFrontendModule['update'] = (input) => {
  return SpaceFrontendModule.andThen(
    { model: input.model },
    (model) => updateEndSpaceButton({ ...input, model }),
    (model) => updateFromMsgSpace({ ...input, model }),
    (model) => updateFromAppEvent({ ...input, model }),
  )
}

const updateFromAppEvent: SpaceFrontendModule['update'] = (input) => {
  const { ctx, model, msgEvt } = input

  switch (msgEvt?.t) {
    case 'auth-evt.unauthenticated': {
      const { currentUserId } = ctx
      const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(model, currentUserId)
      if (!currentUserId || !currentUserSpaceId) {
        return {
          model,
        }
      }

      return {
        model,
        msgSpace: [
          withEventId({
            t: 'user-ended-space',
            spaceId: currentUserSpaceId,
            userId: currentUserId,
          }),
        ],
      }
    }

    default: {
      return {
        model,
      }
    }
  }
}

const updateFromMsgSpace: SpaceFrontendModule['update'] = (input) => {
  const { ctx, model, msgSpace } = input

  switch (msgSpace?.t) {
    case 'user-ended-space': {
      if (!ctx.currentUserId) {
        return {
          model,
        }
      }

      const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(model, ctx.currentUserId)

      if (msgSpace.spaceId !== currentUserSpaceId) {
        return {
          model,
        }
      }

      return SpaceFrontendModule.andThen(
        { model },
        (model) => {
          return {
            model,
            msgCmd: [playSound(APP_SOUND.navBackward)],
          }
        },
        (model) => {
          if (ctx.currentScreen.t === 'space' && ctx.currentScreen.spaceId === msgSpace.spaceId) {
            return {
              model,
              msgCmd: [pushScreen({ n: 'spaces', t: 'space-list' })],
            }
          }
          return {
            model,
            msgCmd: [],
          }
        },
        (model) => {
          if (msgSpace.userId === ctx.currentUserId) {
            return {
              model,
              msgCmd: [showToast(input.ctx.t('spaces.ended-space-current-user'))],
            }
          }

          const profile = ctx.profiles[msgSpace.userId]

          if (!profile) {
            return {
              model,
              msgCmd: [showToast(input.ctx.t('spaces.ended-space-host'))],
            }
          }

          return {
            model,
            msgCmd: [showToast(input.ctx.t('spaces.ended-space-other-user', profile.username))],
          }
        },
      )
    }

    default: {
      return {
        model,
      }
    }
  }
}

const updateEndSpaceButton: SpaceFrontendModule['update'] = ({ msg, model, ctx }) => {
  switch (msg?.t) {
    case 'clicked-end-space-button': {
      if (!ctx.currentUserId) {
        return {
          model,
        }
      }

      const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(model, ctx.currentUserId)

      if (!currentUserSpaceId) {
        return {
          model,
        }
      }

      const spaceEventNew = withEventId<MsgSpace>({
        t: 'user-ended-space',
        spaceId: currentUserSpaceId,
        userId: ctx.currentUserId,
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

export const ViewEndSpaceButton: SpaceFrontendModule['View'] = (input) => {
  const userSpaceId = SpacesCore.toSpaceIdByUserId(input.model, input.ctx.currentUserId)
  if (!userSpaceId) return null

  return (
    <Button
      color='danger'
      variant='text'
      size='xs'
      text={input.ctx.t('spaces.end')}
      onClick={() => input.dispatch({ t: 'clicked-end-space-button', spaceId: userSpaceId })}
    />
  )
}

const viewAction = (input: Parameters<SpaceFrontendModule['View']>[0]): ScreenAction | null => {
  const spaceId = SpacesCore.toSpaceIdByUserId(input.model, input.ctx.currentUserId)
  if (!spaceId) return null

  return {
    icon: (inputIcon) => <IconArrowRightOnRect {...inputIcon} />,
    label: input.ctx.t('spaces.end'),
    onClick: () => input.dispatch({ t: 'clicked-end-space-button', spaceId }),
    color: 'danger',
  }
}

const ViewSpaceEnded: SpaceFrontendModule['View'] = (input) => {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-4'>
      <Typography text={input.ctx.t('spaces.space-ended')} variant='title' />
      <Button
        onClick={() => input.dispatch({ t: 'clicked-go-home-button' })}
        size='lg'
        variant='contained'
        color='primary'
        text={input.ctx.t('spaces.go-home')}
      />
    </div>
  )
}

export const EndSpaceFrontend = {
  ViewSpaceEnded,
  ViewEndSpaceButton,
  update,
  viewAction,
}
