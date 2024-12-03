import { APP_SOUND, playSound, pushRoute, showToast } from '~/app/@/client'
import { Button, Typography } from '~/app/@/ui'
import { SpaceClientModule } from '../@/architecture/space-client'
import type { SpaceEvent } from '../core'
import * as SpacesCoreClient from '../core/client/spaces-core.client'
import { withEventId } from '~/@/event-sourced/event'

const update: SpaceClientModule['update'] = (input) => {
  return SpaceClientModule.andThen(
    { model: input.model },
    (model) => updateEndSpaceButton({ ...input, model }),
    (model) => updateFromSpaceEvent({ ...input, model }),
    (model) => updateFromAppEvent({ ...input, model })
  )
}

const updateFromAppEvent: SpaceClientModule['update'] = (input) => {
  const { ctx, model, msgEvt } = input

  switch (msgEvt?.t) {
    case 'auth/unauthenticated': {
      const { currentUserId } = ctx
      const currentUserSpaceId = SpacesCoreClient.toSpaceIdByUserId(model, currentUserId)
      if (!currentUserId || !currentUserSpaceId) {
        return {
          model
        }
      }

      return {
        model,
        msgCore: [
          withEventId({
            t: 'user-ended-space',
            spaceId: currentUserSpaceId,
            userId: currentUserId
          })
        ]
      }
    }

    default: {
      return {
        model
      }
    }
  }
}

const updateFromSpaceEvent: SpaceClientModule['update'] = (input) => {
  const { ctx, model, msgCore: msgCore } = input

  switch (msgCore?.t) {
    case 'user-ended-space': {
      if (!ctx.currentUserId) {
        return {
          model
        }
      }

      const currentUserSpaceId = SpacesCoreClient.toSpaceIdByUserId(model, ctx.currentUserId)

      if (msgCore.spaceId !== currentUserSpaceId) {
        return {
          model
        }
      }

      return SpaceClientModule.andThen(
        {
          model
        },
        (model) => {
          return {
            model,
            msgCmd: [playSound(APP_SOUND.navBackward)]
          }
        },
        (model) => {
          if (ctx.currentRoute.t === 'space' && ctx.currentRoute.spaceId === msgCore.spaceId) {
            return {
              model,
              msgCmd: [
                pushRoute({
                  n: 'spaces',
                  t: 'space-list'
                })
              ]
            }
          }
          return {
            model,
            msgCmd: []
          }
        },
        (model) => {
          if (msgCore.userId === ctx.currentUserId) {
            return {
              model,
              msgCmd: [showToast(input.ctx.t('spaces.ended-space-current-user'))]
            }
          }

          const profile = ctx.profiles[msgCore.userId]

          if (!profile) {
            return {
              model,
              msgCmd: [showToast(input.ctx.t('spaces.ended-space-host'))]
            }
          }

          return {
            model,
            msgCmd: [showToast(input.ctx.t('spaces.ended-space-other-user', profile.username))]
          }
        }
      )
    }

    default: {
      return {
        model
      }
    }
  }
}

const updateEndSpaceButton: SpaceClientModule['update'] = ({ msg, model, ctx }) => {
  switch (msg?.t) {
    case 'clicked-end-space-button': {
      if (!ctx.currentUserId) {
        return {
          model
        }
      }

      const currentUserSpaceId = SpacesCoreClient.toSpaceIdByUserId(model, ctx.currentUserId)

      if (!currentUserSpaceId) {
        return {
          model
        }
      }

      const spaceEventNew = withEventId<SpaceEvent>({
        t: 'user-ended-space',
        spaceId: currentUserSpaceId,
        userId: ctx.currentUserId
      })

      return {
        model,
        msgCore: [spaceEventNew]
      }
    }
    default: {
      return {
        model
      }
    }
  }
}

export const ViewEndSpaceButton: SpaceClientModule['View'] = (input) => {
  const userSpaceId = SpacesCoreClient.toSpaceIdByUserId(input.model, input.ctx.currentUserId)
  if (!userSpaceId) {
    return null
  }
  return (
    <Button
      color='danger'
      variant='text'
      size='xs'
      text={input.ctx.t('spaces.end')}
      onClick={() =>
        input.dispatch({
          t: 'clicked-end-space-button',
          spaceId: userSpaceId
        })
      }
    />
  )
}

const ViewSpaceEnded: SpaceClientModule['View'] = (input) => {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-4'>
      <Typography text={input.ctx.t('spaces.space-ended')} variant='title' />
      <Button
        onClick={() =>
          input.dispatch({
            t: 'clicked-go-home-button'
          })
        }
        size='lg'
        variant='contained'
        color='primary'
        text={input.ctx.t('spaces.go-home')}
      />
    </div>
  )
}

export const EndSpaceClient = {
  ViewSpaceEnded,
  ViewEndSpaceButton,
  update
}
