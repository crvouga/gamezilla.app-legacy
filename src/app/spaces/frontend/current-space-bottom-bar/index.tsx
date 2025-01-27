import { APP_SOUND, playSound, pushScreen } from '~/app/@/frontend/cmd'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { Avatar, Button, Typography } from '~/@/ui'
import type { SpaceFrontendModule } from '../../@/architecture/space-frontend'
import { SpacesCore } from '../../core/core'
import { GameCoverArt } from '../../game/games/cover-art'
import type { ModelFrontend, MsgFrontend } from '../../types'

const update: SpaceFrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'clicked-current-space-bottom-bar': {
      const currentUsersSpaceId = SpacesCore.toSpaceIdByUserId(input.model, input.ctx.currentUserId)

      if (!currentUsersSpaceId) {
        return {
          model: input.model,
        }
      }

      return {
        model: input.model,
        msgCmd: [
          playSound(APP_SOUND.navForwardMin),
          pushScreen({
            n: 'spaces',
            t: 'space',
            spaceId: currentUsersSpaceId,
          }),
        ],
      }
    }

    default: {
      return {
        model: input.model,
      }
    }
  }
}

const View = (input: { ctx: AppFrontendCtx; model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => {
  const userSpaceId = input.model.indexSpaceIdByUserId[input.ctx.currentUserId]

  if (!userSpaceId) {
    return null
  }

  const space = SpacesCore.toSpaceStarted(input.model, userSpaceId)

  if (!space) {
    return null
  }

  const hostProfile = input.ctx.profiles[space.hostId]

  const userCount = Object.values(space.users).length

  return (
    <div className='flex w-full flex-col items-center justify-center overflow-hidden text-inherit'>
      <div className='h-1 w-full bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500' />
      <div className='flex w-full items-center overflow-hidden text-inherit'>
        <button
          type='button'
          className='flex flex-1 items-center gap-3 overflow-hidden'
          onClick={() => input.dispatch({ t: 'clicked-current-space-bottom-bar' })}
        >
          <div className='p-2'>
            {!space.game ? (
              <Avatar src={hostProfile?.avatarUrl} alt='Host Avatar' className='size-14' />
            ) : (
              <div className='size-14 overflow-hidden rounded border'>
                <GameCoverArt gameName={space.game.t} />
              </div>
            )}
          </div>

          <div className='flex flex-1 flex-col gap-0.5 overflow-hidden py-3 pr-3'>
            <Typography
              variant='title'
              className='truncate text-left text-lg font-normal'
              text={
                hostProfile
                  ? input.ctx.t('spaces.current-space', {
                      hostUsername: hostProfile.username,
                    })
                  : input.ctx.t('spaces.space')
              }
            />
            <Typography
              variant='subtitle'
              className='truncate text-left'
              text={input.ctx.t('space-card.people-count', userCount)}
            />
          </div>
        </button>

        <div className='pr-4'>
          {input.ctx.currentUserId === space.hostId && (
            <Button
              color='danger'
              variant='text'
              text={input.ctx.t('spaces.end')}
              onClick={() =>
                input.dispatch({
                  t: 'clicked-end-space-button',
                  spaceId: userSpaceId,
                })
              }
              size='sm'
            />
          )}

          {input.ctx.currentUserId !== space.hostId && (
            <Button
              color='danger'
              variant='text'
              text={input.ctx.t('spaces.leave')}
              onClick={() =>
                input.dispatch({
                  t: 'clicked-leave-space-button',
                  spaceId: userSpaceId,
                })
              }
              size='sm'
            />
          )}
        </div>
      </div>
    </div>
  )
}

export const CurrentSpaceBottomBar = {
  update,
  View,
}
