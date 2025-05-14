import { TranslatedText } from '~/@/l18n'
import { Avatar } from '~/@/ui/avatar'
import { Button } from '~/@/ui/button'
import { ClickablePaper } from '~/@/ui/clickable'
import { IconQuestionMark } from '~/@/ui/icon/icon-question-mark'
import { Typography } from '~/@/ui/typography'
import type { VDom } from '~/@/vdom/vdom'
import type { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { ScreenLayoutGameCoverArt } from '../ui/screen-layout-game-cover-art'

type IconProps = { className: string }

type PlayerProp = {
  label: TranslatedText
  userId: UserId | null
  onStartPlaying: () => void
  onStopPlaying: () => void
  renderIcon: (props: IconProps) => VDom
}

const VersusSection = ({
  playerOne,
  playerTwo,
  ctx,
}: {
  playerOne: PlayerProp
  playerTwo: PlayerProp
  ctx: SpaceFrontendCtx
}) => {
  return (
    <div className='flex w-full flex-col gap-2 p-4'>
      <div className='grid w-full grid-cols-7'>
        <PlayerIcons player={playerOne} ctx={ctx} />

        <div className='col-span-1'>
          <Typography
            text={ctx.t('game.vs')}
            variant='title'
            className='flex h-full flex-1 flex-col items-center justify-center text-3xl font-black'
          />
        </div>

        <PlayerIcons player={playerTwo} ctx={ctx} />
      </div>

      <div className='grid w-full grid-cols-7'>
        <PlayerLabels player={playerOne} ctx={ctx} />

        <div className='col-span-1' />

        <PlayerLabels player={playerTwo} ctx={ctx} />
      </div>

      <div className='mt-2 grid w-full grid-cols-7'>
        <PlayerButtons player={playerOne} ctx={ctx} />

        <div className='col-span-1' />

        <PlayerButtons player={playerTwo} ctx={ctx} />
      </div>
    </div>
  )
}

export const VsUserSetup = {
  VersusSection,
}

const PlayerButtons = ({ player, ctx }: { ctx: SpaceFrontendCtx; player: PlayerProp }) => {
  return (
    <div className='col-span-3 w-full'>
      {player.userId && player.userId === ctx.currentUser.userId && (
        <Button
          key='toggle-play-button'
          className='w-full'
          variant='text'
          color='primary'
          onClick={player.onStopPlaying}
          text={ctx.t('game.stop-playing')}
        />
      )}

      {!player.userId && (
        <Button
          key='toggle-play-button'
          className='w-full'
          variant='contained'
          color='primary'
          onClick={player.onStartPlaying}
          text={ctx.t('game.start-playing')}
        />
      )}
    </div>
  )
}

const PlayerIcons = ({ player, ctx }: { ctx: SpaceFrontendCtx; player: PlayerProp }) => {
  return (
    <div
      className='col-span-3 grid w-full cursor-pointer grid-cols-2 place-items-center text-center'
      onClick={player.userId === ctx.currentUser.userId ? player.onStopPlaying : player.onStartPlaying}
    >
      {player.userId ? (
        <Avatar className='h-14 w-14' src={UserProfile.toAvatarUrl(ctx.profilesByUserId[player.userId])} alt='' />
      ) : (
        <ClickablePaper
          role='button'
          className='grid h-14 w-14 place-items-center overflow-hidden rounded-full'
          onClick={player.onStartPlaying}
        >
          <IconQuestionMark className='text-secondary h-10 w-10' />
        </ClickablePaper>
      )}

      {player.renderIcon({
        className: 'h-14 w-14',
      })}
    </div>
  )
}

const PlayerLabels = ({ player, ctx }: { ctx: SpaceFrontendCtx; player: PlayerProp }) => {
  return (
    <div className='col-span-3 grid w-full grid-cols-2 place-items-center text-center text-sm'>
      <Typography
        className='w-full overflow-hidden text-center text-ellipsis whitespace-nowrap'
        text={TranslatedText.of(player.userId ? (ctx.profilesByUserId[player.userId]?.username ?? '...') : '?')}
        variant='body'
        color='text-secondary'
      />

      <Typography
        color='text-secondary'
        className='w-full overflow-hidden text-center text-ellipsis whitespace-nowrap'
        text={player.label}
        variant='body'
      />
    </div>
  )
}

export const VsUserSetupScreen = ({
  playerOne,
  playerTwo,
  ctx,
  title,
  renderCoverArt,
  onStartGame,
  onQuit,
  canStartGame = Boolean(playerOne.userId && playerTwo.userId),
}: {
  ctx: SpaceFrontendCtx
  title: TranslatedText
  renderCoverArt: (props: { className: string }) => VDom
  playerOne: PlayerProp
  playerTwo: PlayerProp
  onStartGame: () => void
  onQuit: () => void
  canStartGame?: boolean
}) => {
  return (
    <div className='flex h-full w-full flex-1 flex-col overflow-hidden'>
      <ScreenLayoutGameCoverArt
        id='vs-user-setup'
        parentScreen={ctx.parentScreen}
        ctx={ctx}
        navBar={{
          title,
          back: {
            onClick: onQuit,
          },
        }}
        renderCoverArt={renderCoverArt}
        renderBody={() => <VersusSection playerOne={playerOne} playerTwo={playerTwo} ctx={ctx} />}
      />

      {ctx.currentUser.userId === ctx.space.hostId && (
        <div className='flex w-full items-center gap-4 p-4'>
          <Button
            disabled={!canStartGame}
            variant='contained'
            color='primary'
            className='flex-1'
            onClick={onStartGame}
            text={ctx.t('game.start-game')}
          />
        </div>
      )}
    </div>
  )
}
