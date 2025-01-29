import type { VDom } from '~/@/vdom/vdom'
import type { UserId } from '~/app/@/data/user-id'
import { Avatar, Button, IconQuestionMark, Typography } from '~/@/ui'

import { ScreenLayoutGameCoverArt } from '../ui/screen-layout-game-cover-art'
import { TranslatedText } from '~/@/l18n'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'

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
      {player.userId && player.userId === ctx.currentUserId && (
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
      onClick={player.userId === ctx.currentUserId ? player.onStopPlaying : player.onStartPlaying}
    >
      {player.userId ? (
        <Avatar className='h-14 w-14' src={ctx.profiles[player.userId]?.avatarUrl} alt='' />
      ) : (
        <div role='button' className='bg-paper grid h-14 w-14 place-items-center overflow-hidden rounded-full'>
          <IconQuestionMark className='text-secondary h-10 w-10' />
        </div>
      )}

      {player.renderIcon({
        className: 'h-14 w-14',
      })}
    </div>
  )
}

const PlayerLabels = ({ player, ctx }: { ctx: SpaceFrontendCtx; player: PlayerProp }) => {
  return (
    <div className='text-secondary col-span-3 grid w-full grid-cols-2 place-items-center text-center text-sm'>
      <p className='w-full overflow-hidden text-ellipsis whitespace-nowrap text-center'>
        {player.userId ? (ctx.profiles[player.userId]?.username ?? '...') : '?'}
      </p>

      <Typography
        className='w-full overflow-hidden text-ellipsis whitespace-nowrap text-center'
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
        parentScreen={ctx.parentScreen}
        ctx={ctx}
        navBar={{
          title,
          onBack: onQuit,
        }}
        renderCoverArt={renderCoverArt}
        renderContent={() => <VersusSection playerOne={playerOne} playerTwo={playerTwo} ctx={ctx} />}
      />

      {ctx.currentUserId === ctx.space.hostId && (
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
