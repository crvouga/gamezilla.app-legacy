import { Avatar } from '~/@/ui/avatar'
import { cn } from '~/@/ui/cn'
import { IconButton } from '~/@/ui/icon-button'
import { IconXMark } from '~/@/ui/icon/icon-x-mark'
import { Typography } from '~/@/ui/typography'
import { UserProfile } from '~/app/@/data/user-profile'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd'
import type { SpaceFrontendModule } from '../../architecture/space-frontend'
import { SpacesCore } from '../../core/core'
import { GameCoverArt } from '../../game/games/cover-art'
import { SPACE_CARD_GRADIENT_CLASS_NAME } from '../../list-spaces/space-card/space-card-gradient'
import type { ModelFrontend, MsgFrontend } from '../../types'

const update: SpaceFrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'current-space-bar.clicked-current-space-bottom-bar': {
      const currentUsersSpaceId = SpacesCore.toSpaceIdByUserId(input.model.spaces, input.ctx.currentUser?.userId)

      if (!currentUsersSpaceId) return { model: input.model }

      return {
        model: input.model,
        msgOut: [
          PlaySoundCmd.init(APP_SOUND.navForwardMin),
          PushScreenCmd.init({ n: 'spaces', t: 'space', spaceId: currentUsersSpaceId }),
        ],
      }
    }
  }
  return { model: input.model }
}

const View = (input: { ctx: AppFrontendCtx; model: ModelFrontend; dispatch: (msg: MsgFrontend) => void }) => {
  const userSpaceId = SpacesCore.toSpaceIdByUserId(input.model.spaces, input.ctx.currentUser.userId)
  const space = SpacesCore.toSpaceStarted(input.model.spaces, userSpaceId)

  if (!space) return null

  const hostProfile = input.ctx.profilesByUserId[space.hostId]

  const userCount = Object.values(space.users).length
  const isCurrentUserHost = input.ctx.currentUser.userId === space.hostId
  return (
    <div
      className={cn(
        'flex w-full flex-row items-center justify-center overflow-hidden rounded-lg text-inherit',
        SPACE_CARD_GRADIENT_CLASS_NAME,
        'rounded-lg',
      )}
    >
      <button
        type='button'
        className='flex flex-1 items-center gap-3 overflow-hidden'
        onClick={() => input.dispatch({ t: 'current-space-bar.clicked-current-space-bottom-bar' })}
      >
        <div className='p-2'>
          {!space.game ? (
            <Avatar
              src={hostProfile ? UserProfile.toAvatarUrl(hostProfile) : ''}
              alt='Host Avatar'
              className='size-14'
            />
          ) : (
            <GameCoverArt rounded className='size-14' gameName={space.game.t} />
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
        {isCurrentUserHost && (
          <IconButton
            renderIcon={(iconInput) => <IconXMark {...iconInput} />}
            label={input.ctx.t('spaces.end')}
            onClick={() => input.dispatch({ t: 'end-space.clicked-end-space-button', spaceId: space.spaceId })}
          />
        )}

        {!isCurrentUserHost && (
          <IconButton
            renderIcon={(iconInput) => <IconXMark {...iconInput} />}
            label={input.ctx.t('spaces.leave')}
            onClick={() => input.dispatch({ t: 'leave-space.clicked-leave-space-button', spaceId: space.spaceId })}
          />
        )}
      </div>
    </div>
  )
}

export const CurrentSpaceMiniPlayer = {
  update,
  View,
}
