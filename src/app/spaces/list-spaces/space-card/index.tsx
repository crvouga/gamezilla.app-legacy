import { BaseFrontendCtx } from '~/app/@/frontend/ctx'
import { Avatar, cn, Typography } from '~/@/ui'
import { ViewHostChip } from '~/app/spaces/game/games/@/ui/users-in-space-list/host-chip'
import { ViewYouChip } from '~/app/spaces/game/games/@/ui/users-in-space-list/you-chip'
import { GameCoverArt } from '~/app/spaces/game/games/cover-art'
import { SpaceState } from '../../core/space-state'
import { SPACE_CARD_GRADIENT_CLASS_NAME } from './space-card-gradient'

const MAX_AVATAR_COUNT = 3

export const ViewSpaceCard = (input: { ctx: BaseFrontendCtx; state: SpaceState.Started; onClick?: () => void }) => {
  const host = input.ctx.profiles[input.state.hostId]
  const users = Object.values(input.state.users).flatMap((userId) => {
    const profile = input.ctx.profiles[userId]

    if (!profile) {
      return []
    }

    return [
      {
        username: profile.username,
        avatarUrl: profile.avatarUrl,
      },
    ]
  })

  const gameName = input.state.game?.t ?? null

  return (
    <button
      type='button'
      onClick={input.onClick}
      disabled={!input.onClick}
      className={cn(
        SPACE_CARD_GRADIENT_CLASS_NAME,
        'flex h-fit flex-col gap-3 overflow-hidden rounded-md bg-gradient-to-tr p-4',
        input.onClick && 'clickable',
      )}
    >
      <div className='flex w-full items-center justify-start'>
        <Typography
          variant='label'
          className='block flex-1 text-left text-lg font-bold uppercase text-white'
          text={input.ctx.t('space-card.live')}
        />
      </div>

      {gameName && (
        <div className='flex items-center justify-start gap-2'>
          <div className='h-12 w-12 overflow-hidden rounded border-2 border-white/40'>
            <GameCoverArt gameName={gameName} />
          </div>
          <Typography variant='title' className='truncate text-lg font-normal' text={input.ctx.t(gameName)} />
        </div>
      )}

      <div className='flex max-w-full items-center justify-start gap-2 overflow-hidden'>
        <Avatar src={host?.avatarUrl} alt='avatar' className='h-12 w-12' />

        <div className='flex-1 overflow-hidden'>
          {host && (
            <Typography
              variant='title'
              className='truncate text-lg font-normal'
              text={input.ctx.t('username', host.username)}
            />
          )}
        </div>
        <ViewHostChip ctx={input.ctx} />
        {input.ctx.currentUserId === host?.userId && <ViewYouChip ctx={input.ctx} />}
      </div>

      {users.length > 1 && (
        <div className='flex items-center justify-start gap-2'>
          <div className='flex items-center'>
            {users.slice(0, MAX_AVATAR_COUNT).map((user, index) => (
              <Avatar
                key={user.username}
                src={user.avatarUrl}
                alt='avatar'
                className={cn('h-8 w-8', index !== 0 && '-ml-2')}
              />
            ))}
            {users.length > MAX_AVATAR_COUNT && (
              <div className='-ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/30'>
                <Typography variant='label' text={input.ctx.t('app.+number', users.length - MAX_AVATAR_COUNT)} />
              </div>
            )}
          </div>
          <Typography
            variant='body'
            className='truncate text-lg font-normal'
            text={input.ctx.t('space-card.people-count', users.length)}
          />
        </div>
      )}
    </button>
  )
}
