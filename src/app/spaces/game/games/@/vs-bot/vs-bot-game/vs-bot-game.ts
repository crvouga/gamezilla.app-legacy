import type { UserId } from '~/app/@/data/user-id'
import { IconRobot } from '~/@/ui/icon'
import { Paper } from '~/@/ui/paper'
import { Avatar } from '~/@/ui/avatar'
import { Transition } from '~/@/ui/transition'
import { cn } from '~/@/ui/cn'
import { Typography } from '~/@/ui/typography'
import type { PlayerType, VsBotInput } from '../vs-bot'
import type { VDom } from '~/@/vdom/vdom'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { UserProfile } from '~/app/@/data/user-profile'
import { TranslatedText } from '~/@/l18n/translations'
import { v } from '~/@/vdom/v'

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
  ctx: SpaceFrontendCtx
  model?: Model
  gameOver: GameOver | null
  human: {
    userId: UserId
    player: PlayerType
  }
  bot: {
    label: string
    renderIcon: (input: { class: string }) => VDom
  }
  playerOne: {
    renderIcon: (input: { class: string }) => VDom
  }
  playerTwo: {
    renderIcon: (input: { class: string }) => VDom
  }
  onPlayAgain?: () => void
}

export type VsBotGameInput = VsBotInput & {
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
  return v(
    Transition,
    {
      id: 'status-bar',
      mode: 'in-out',
      onEnter: fadeIn({
        duration: 300,
        delay: 0,
      }),
      onExit: fadeOut({
        duration: 300,
        delay: 0,
      }),
      class: 'relative h-8 w-full',
    },
    [
      v('div', { key: statusToKey(input.status), class: 'absolute inset-0 flex items-center justify-center gap-1' }, [
        ViewStatusBarContent(input),
      ]),
    ],
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
          return v('div', {}, [
            input.playerOne.renderIcon({
              class: 'h-5 w-5',
            }),
            v(Typography, { text: TranslatedText.of('Turn'), color: 'text-secondary' }),
          ])
        }

        case 'player-two': {
          return v('div', {}, [
            input.playerTwo.renderIcon({
              class: 'h-5 w-5',
            }),
            v(Typography, { text: TranslatedText.of('Turn'), color: 'text-secondary' }),
          ])
        }
      }
    }

    default: {
      return v(Typography, { text: TranslatedText.of('Game Over'), color: 'text-secondary' })
    }
  }
}

export const ViewGameOverOverlay = (input: Input & { isSpectating: boolean }) => {
  const { gameOver } = input

  return v(
    Transition,
    {
      id: 'game-over-overlay',
      mode: 'out-in',
      onEnter: fadeIn({
        duration: 200,
        delay: 500,
      }),
      onExit: fadeOut({
        duration: 200,
        delay: 0,
      }),
    },
    [
      gameOver?.t === 'winner' &&
        v(
          'button',
          {
            class: 'absolute inset-0 flex flex-col items-center justify-center bg-black/70',
            disabled: input.isSpectating,
            onClick: !input.isSpectating ? input.onPlayAgain : undefined,
          },
          [
            v('div', { class: 'flex-1' }),
            v(Winner, { ...input, winner: gameOver.winner }),
            input.onPlayAgain && !input.isSpectating
              ? v('div', { class: 'flex flex-1 items-center justify-center pb-2 text-2xl font-bold' }, [
                  'Tap to play again',
                ])
              : v('div', { class: 'flex-1' }),
          ],
        ),
      gameOver?.t === 'draw' &&
        v(
          'button',
          {
            class: 'absolute inset-0 flex flex-col items-center justify-center bg-black/60',
            disabled: input.isSpectating,
            onClick: !input.isSpectating ? input.onPlayAgain : undefined,
          },
          [
            v('div', { class: 'flex-1' }),
            v(Draw, input),
            input.onPlayAgain && !input.isSpectating
              ? v('div', { class: 'flex flex-1 items-center justify-center pb-2 text-2xl font-bold opacity-0' }, [
                  'Tap to play again',
                ])
              : v('div', { class: 'flex-1' }),
          ],
        ),
    ].filter(Boolean),
  )
}

const Winner = ({ ctx, playerOne, playerTwo, human, bot, winner }: Input & { winner: PlayerType }) => {
  const humanSlot = v('div', {}, [
    v(Avatar, { class: 'size-16', src: UserProfile.toAvatarUrl(ctx.profilesByUserId[human.userId]) }),
  ])

  const botSlot = v('div', {}, [
    bot.renderIcon({
      class: 'size-16',
    }),
  ])

  const playerOneSlot = v('div', { class: 'flex flex-col items-center justify-center gap-3' }, [
    v('div', { class: 'flex items-center justify-center gap-3' }, [
      playerOne.renderIcon({
        class: 'size-16',
      }),
      human.player === 'player-one' ? humanSlot : botSlot,
    ]),
    v(Typography, {
      variant: 'title',
      class: 'text-center text-4xl font-black',
      text: winner === 'player-one' ? ctx.t('game.winner') : ctx.t('game.loser'),
    }),
  ])

  const playerTwoSlot = v('div', { class: 'flex flex-col items-center justify-center gap-3' }, [
    v('div', { class: 'flex items-center justify-center gap-3' }, [
      playerTwo.renderIcon({
        class: 'size-16',
      }),
      human.player === 'player-two' ? humanSlot : botSlot,
    ]),
    v(Typography, {
      variant: 'title',
      class: 'text-center text-4xl font-black',
      text: winner === 'player-two' ? ctx.t('game.winner') : ctx.t('game.loser'),
    }),
  ])

  return v('div', { class: 'grid w-full flex-1 grid-cols-2 items-center' }, [playerOneSlot, playerTwoSlot])
}

const Draw = (input: Input) => {
  const humanSlot = v('div', {}, [
    v(Avatar, { src: UserProfile.toAvatarUrl(input.ctx.profilesByUserId[input.ctx.currentUser.userId]) }),
  ])

  const botSlot = v('div', {}, [v(IconRobot, { class: 'size-6' })])

  const playerOneSlot = v('div', {}, [
    input.playerOne.renderIcon({
      class: 'h-5 w-5',
    }),
    input.human.player === 'player-one' ? humanSlot : botSlot,
  ])

  const playerTwoSlot = v('div', {}, [
    input.playerTwo.renderIcon({
      class: 'h-5 w-5',
    }),
    input.human.player === 'player-two' ? humanSlot : botSlot,
  ])

  return v('div', { class: 'flex h-full w-full flex-1 items-center justify-center' }, [
    v('div', {}, [playerOneSlot, playerTwoSlot]),
    v('p', {}, ['Tie']),
  ])
}

export const VsBotPlayerSection = ({ ctx, human, bot, playerOne, playerTwo, turn }: VsBotGameInput) => {
  const profile = ctx.profilesByUserId[human.userId]
  const humanSlot = v('div', {}, [
    v(Avatar, { class: 'size-6', src: UserProfile.toAvatarUrl(profile) }),
    profile && v(Typography, { class: 'truncate', variant: 'body', text: ctx.t('username', profile.username) }),
  ])

  const botSlot = v('div', {}, [
    bot.renderIcon({
      class: 'size-6 flex-shrink-0',
    }),
    v(Typography, { class: 'truncate', variant: 'body', text: bot.label }),
  ])

  return v('section', { class: 'flex w-full items-center gap-3 px-3' }, [
    v('div', { class: 'flex w-1/2 items-center justify-center overflow-hidden' }, [
      v(Slot, { active: turn === 'player-one' }, [
        v('div', {}, [
          playerOne.renderIcon({
            class: 'size-6',
          }),
        ]),
        human.player === 'player-one' ? humanSlot : botSlot,
      ]),
    ]),
    v('div', { class: 'flex w-1/2 items-center justify-center overflow-hidden' }, [
      v(Slot, { active: turn === 'player-two' }, [
        playerTwo.renderIcon({
          class: 'size-6',
        }),
        human.player === 'player-two' ? humanSlot : botSlot,
      ]),
    ]),
  ])
}

const Slot = ({ active, children }: { active: boolean; children?: VDom }) => {
  return v(
    Paper,
    {
      class: cn(
        'flex max-w-full flex-1 items-center gap-2 rounded-md bg-black p-2 text-sm transition-colors duration-200 ease-in-out',
        active && 'border-b-blue-500',
      ),
    },
    [children],
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
          opacity: 0,
        },
        {
          opacity: 1,
        },
      ],
      {
        duration: duration,
        delay: delay,
        easing: 'ease-in-out',
        fill: 'both',
      },
    ).finished
  }

const fadeOut =
  ({ duration, delay }: { delay: number; duration: number }) =>
  async (node: HTMLElement) => {
    await node.animate(
      [
        {
          opacity: 1,
        },
        {
          opacity: 0,
        },
      ],
      {
        duration: duration,
        delay: delay,
        easing: 'ease-in-out',
        fill: 'both',
      },
    ).finished
  }
