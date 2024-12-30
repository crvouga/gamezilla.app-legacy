import type { UserId } from '~/app/@/data/user-id'
import { IconRobot, Avatar, Transition, cn, Typography } from '~/app/@/ui'
import type { PlayerType, VsBotInput } from '../vs-bot'
import type { VDom, VDomChildren } from '~/@/vdom'
import { SpaceClientCtx } from '~/app/spaces/@/space-client/ctx'

//
//
//
// Model
//
//
//

export type Model = null

export function init(_gameOver?: GameOver | null): Model {
  return null
}

//
//
//
// Update
//
//
//

export type Msg = {
  t: null
}

export const update = (model: Model, _msg: Msg): Model => {
  return model
}

//
//
//
// View
//
//
//

export type GameOver =
  | {
      t: null
    }
  | {
      t: 'winner'
      winner: PlayerType
    }
  | {
      t: 'draw'
    }

type Input = {
  ctx: SpaceClientCtx
  model?: Model
  gameOver: GameOver | null
  human: {
    userId: UserId
    player: PlayerType
  }
  bot: {
    label: string
    renderIcon: (input: { className: string }) => VDom
  }
  playerOne: {
    renderIcon: (input: { className: string }) => VDom
  }
  playerTwo: {
    renderIcon: (input: { className: string }) => VDom
  }
  onPlayAgain?: () => void
}

export type VsBotGameinput = VsBotInput & {
  turn: PlayerType | null
  human: {
    player: PlayerType
    userId: UserId
  }
  isSpectating: boolean
}

export type Status =
  | {
      t: 'playing'
      turn: PlayerType
    }
  | {
      t: 'winner'
      winner: PlayerType
    }
  | {
      t: 'draw'
    }

export const ViewStatusBar = (input: VsBotInput & { status: Status }) => {
  return (
    <Transition
      id='status-bar'
      mode='in-out'
      onEnter={fadeIn({
        duration: 300,
        delay: 0
      })}
      onExit={fadeOut({
        duration: 300,
        delay: 0
      })}
      className='relative h-8 w-full'
    >
      <div
        key={statusToKey(input.status)}
        className='text-secondary absolute inset-0 flex items-center justify-center gap-1'
      >
        <ViewStatusBarContent {...input} />
      </div>
    </Transition>
  )
}

function statusToKey(status: Status) {
  switch (status.t) {
    case 'playing': {
      switch (status.turn) {
        case 'player-one': {
          return 'playing/player-one'
        }

        case 'player-two': {
          return 'playing/player-two'
        }
      }
    }

    case 'winner': {
      switch (status.winner) {
        case 'player-one': {
          return 'winner/player-one'
        }

        case 'player-two': {
          return 'winner/player-two'
        }
      }
    }

    case 'draw': {
      return 'draw'
    }
  }
}

const ViewStatusBarContent = (input: VsBotInput & { status: Status }) => {
  switch (input.status.t) {
    case 'playing': {
      switch (input.status.turn) {
        case 'player-one': {
          return (
            <>
              {input.playerOne.renderIcon({
                className: 'h-5 w-5'
              })}
              <p>Turn</p>
            </>
          )
        }

        case 'player-two': {
          return (
            <>
              {input.playerTwo.renderIcon({
                className: 'h-5 w-5'
              })}
              <p>Turn</p>
            </>
          )
        }
      }
    }

    default: {
      return <p>Game Over</p>
    }
  }
}

export const ViewGameOverOverlay = (input: Input & { isSpectating: boolean }) => {
  const { gameOver } = input

  return (
    <Transition
      id='game-over-overlay'
      mode='out-in'
      onEnter={fadeIn({
        duration: 200,
        delay: 500
      })}
      onExit={fadeOut({
        duration: 200,
        delay: 0
      })}
    >
      {gameOver?.t === 'winner' && (
        <button
          className='absolute inset-0 flex flex-col items-center justify-center bg-black/70'
          disabled={input.isSpectating}
          onClick={!input.isSpectating ? input.onPlayAgain : undefined}
        >
          <div className='flex-1' />

          <Winner {...input} winner={gameOver.winner} />

          {input.onPlayAgain && !input.isSpectating ? (
            <div className='flex flex-1 items-center justify-center pb-2 text-2xl font-bold'>Tap to play again</div>
          ) : (
            <div className='flex-1' />
          )}
        </button>
      )}
      {gameOver?.t === 'draw' && (
        <button
          className='absolute inset-0 flex flex-col items-center justify-center bg-black/60'
          disabled={input.isSpectating}
          onClick={!input.isSpectating ? input.onPlayAgain : undefined}
        >
          <div className='flex-1' />

          <Draw {...input} />

          {input.onPlayAgain && !input.isSpectating ? (
            <div className='flex flex-1 items-center justify-center pb-2 text-2xl font-bold opacity-0'>
              Tap to play again
            </div>
          ) : (
            <div className='flex-1' />
          )}
        </button>
      )}
    </Transition>
  )
}

const Winner = ({ ctx, playerOne, playerTwo, human, bot, winner }: Input & { winner: PlayerType }) => {
  const humanSlot = (
    <>
      <Avatar className='h-16 w-16' src={ctx.profiles[human.userId]?.avatarUrl} />
    </>
  )

  const botSlot = (
    <>
      {bot.renderIcon({
        className: 'h-16 w-16'
      })}
    </>
  )

  const playerOneSlot = (
    <div className='flex flex-col items-center justify-center gap-3'>
      <div className='flex items-center justify-center gap-3'>
        {playerOne.renderIcon({
          className: 'h-16 w-16'
        })}
        {human.player === 'player-one' ? humanSlot : botSlot}
      </div>

      <Typography
        variant='title'
        className='text-center text-4xl font-black'
        text={winner === 'player-one' ? ctx.t('game.winner') : ctx.t('game.loser')}
      />
    </div>
  )

  const playerTwoSlot = (
    <div className='flex flex-col items-center justify-center gap-3'>
      <div className='flex items-center justify-center gap-3'>
        {playerTwo.renderIcon({
          className: 'h-16 w-16'
        })}

        {human.player === 'player-two' ? humanSlot : botSlot}
      </div>

      <Typography
        variant='title'
        className='text-center text-4xl font-black'
        text={winner === 'player-two' ? ctx.t('game.winner') : ctx.t('game.loser')}
      />
    </div>
  )

  return (
    <div className='grid w-full flex-1 grid-cols-2 items-center'>
      {playerOneSlot}
      {playerTwoSlot}
    </div>
  )
}

const Draw = (input: Input) => {
  const humanSlot = (
    <>
      <Avatar src={input.ctx.profiles[input.ctx.currentUserId]?.avatarUrl} />
    </>
  )

  const botSlot = (
    <>
      <IconRobot className='h-6 w-6' />
    </>
  )

  const playerOneSlot = (
    <>
      {input.playerOne.renderIcon({
        className: 'h-5 w-5'
      })}
      {input.human.player === 'player-one' ? humanSlot : botSlot}
    </>
  )

  const playerTwoSlot = (
    <>
      {input.playerTwo.renderIcon({
        className: 'h-5 w-5'
      })}
      {input.human.player === 'player-two' ? humanSlot : botSlot}
    </>
  )

  return (
    <div className='flex h-full w-full flex-1 items-center justify-center'>
      <div>
        {playerOneSlot}
        {playerTwoSlot}
      </div>
      <p>Tie</p>
    </div>
  )
}

export const VsBotPlayerSection = ({ ctx, human, bot, playerOne, playerTwo, turn }: VsBotGameinput) => {
  const profile = ctx.profiles[human.userId]
  const humanSlot = (
    <>
      <Avatar className='h-6 w-6' src={ctx.profiles[human.userId]?.avatarUrl} />
      {profile && <Typography className='truncate' variant='body' text={ctx.t('username', profile.username)} />}
    </>
  )

  const botSlot = (
    <>
      {bot.renderIcon({
        className: 'h-6 w-6 flex-shrink-0'
      })}
      <Typography className='truncate' variant='body' text={bot.label} />
    </>
  )

  return (
    <section className='flex w-full items-center gap-3 px-3'>
      <div className='flex w-1/2 items-center justify-center overflow-hidden'>
        <Slot active={turn === 'player-one'}>
          <div>
            {playerOne.renderIcon({
              className: 'h-6 w-6'
            })}
          </div>
          {human.player === 'player-one' ? humanSlot : botSlot}
        </Slot>
      </div>

      <div className='flex w-1/2 items-center justify-center overflow-hidden'>
        <Slot active={turn === 'player-two'}>
          {playerTwo.renderIcon({
            className: 'h-6 w-6'
          })}
          {human.player === 'player-two' ? humanSlot : botSlot}
        </Slot>
      </div>
    </section>
  )
}

const Slot = ({ active, children }: { active: boolean; children: VDomChildren }) => {
  return (
    <div
      className={cn(
        'flex max-w-full flex-1 items-center gap-2 rounded-md border border-b-2 bg-black p-2 text-sm transition-colors duration-200 ease-in-out',
        active && 'border-b-blue-500'
      )}
    >
      {children}
    </div>
  )
}

//
//
//
//
//
//
//
//

const fadeIn =
  ({ duration, delay }: { delay: number; duration: number }) =>
  async (node: HTMLElement) => {
    await node.animate(
      [
        {
          opacity: 0
        },
        {
          opacity: 1
        }
      ],
      {
        duration: duration,
        delay: delay,
        easing: 'ease-in-out',
        fill: 'both'
      }
    ).finished
  }

const fadeOut =
  ({ duration, delay }: { delay: number; duration: number }) =>
  async (node: HTMLElement) => {
    await node.animate(
      [
        {
          opacity: 1
        },
        {
          opacity: 0
        }
      ],
      {
        duration: duration,
        delay: delay,
        easing: 'ease-in-out',
        fill: 'both'
      }
    ).finished
  }
