import { TranslatedText } from '~/@/l18n/translations'
import { Avatar } from '~/@/ui/avatar'
import { cn } from '~/@/ui/cn'
import { IconRobot } from '~/@/ui/icon'
import { Paper } from '~/@/ui/paper'
import { Transition } from '~/@/vdom/primitives/transition'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Pressable } from '~/@/vdom/primitives/pressable'
import type { VDom } from '~/@/vdom/vdom'
import type { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import type { PlayerType, VsBotInput } from '../vs-bot'
import { Text } from '~/@/vdom/primitives/text'

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
  return h(
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
      h(
        Box,
        { key: statusToKey(input.status), class: 'absolute inset-0 flex flex-row items-center justify-center gap-1' },
        [ViewStatusBarContent(input)],
      ),
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
          return h(Box, {}, [
            input.playerOne.renderIcon({
              class: 'h-5 w-5',
            }),
            h(Typography, { text: TranslatedText.of('Turn'), color: 'text-secondary' }),
          ])
        }

        case 'player-two': {
          return h(Box, {}, [
            input.playerTwo.renderIcon({
              class: 'h-5 w-5',
            }),
            h(Typography, { text: TranslatedText.of('Turn'), color: 'text-secondary' }),
          ])
        }
      }
    }

    default: {
      return h(Typography, { text: TranslatedText.of('Game Over'), color: 'text-secondary' })
    }
  }
}

export const ViewGameOverOverlay = (input: Input & { isSpectating: boolean }) => {
  const { gameOver } = input

  return h(
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
        h(
          Pressable,
          {
            class: 'absolute inset-0 flex flex-col items-center justify-center bg-black/70',
            disabled: input.isSpectating,
            onPressDown: !input.isSpectating ? input.onPlayAgain : undefined,
          },
          [
            h(Box, { class: 'flex-1' }),
            h(Winner, { ...input, winner: gameOver.winner }),
            input.onPlayAgain && !input.isSpectating
              ? h(Box, { class: 'flex flex-row flex-1 items-center justify-center pb-2 text-2xl font-bold' }, [
                  Text({ text: 'Tap to play again' }),
                ])
              : h(Box, { class: 'flex-1' }),
          ],
        ),
      gameOver?.t === 'draw' &&
        h(
          Pressable,
          {
            class: 'absolute inset-0 flex flex-col items-center justify-center bg-black/60',
            disabled: input.isSpectating,
            onPressDown: !input.isSpectating ? input.onPlayAgain : undefined,
          },
          [
            h(Box, { class: 'flex-1' }),
            h(Draw, input),
            input.onPlayAgain && !input.isSpectating
              ? h(
                  Box,
                  { class: 'flex flex-row flex-1 items-center justify-center pb-2 text-2xl font-bold opacity-0' },
                  [Text({ text: 'Tap to play again' })],
                )
              : h(Box, { class: 'flex-1' }),
          ],
        ),
    ].filter(Boolean),
  )
}

const Winner = ({ ctx, playerOne, playerTwo, human, bot, winner }: Input & { winner: PlayerType }) => {
  const humanSlot = h(Box, {}, [
    h(Avatar, { class: 'size-16', src: UserProfile.toAvatarUrl(ctx.profilesByUserId[human.userId]) }),
  ])

  const botSlot = h(Box, {}, [
    bot.renderIcon({
      class: 'size-16',
    }),
  ])

  const playerOneSlot = h(Box, { class: 'flex flex-col items-center justify-center gap-3' }, [
    h(Box, { class: 'flex flex-row items-center justify-center gap-3' }, [
      playerOne.renderIcon({
        class: 'size-16',
      }),
      human.player === 'player-one' ? humanSlot : botSlot,
    ]),
    h(Typography, {
      variant: 'title',
      class: 'text-center text-4xl font-black',
      text: winner === 'player-one' ? ctx.t('game.winner') : ctx.t('game.loser'),
    }),
  ])

  const playerTwoSlot = h(Box, { class: 'flex flex-col items-center justify-center gap-3' }, [
    h(Box, { class: 'flex flex-row items-center justify-center gap-3' }, [
      playerTwo.renderIcon({
        class: 'size-16',
      }),
      human.player === 'player-two' ? humanSlot : botSlot,
    ]),
    h(Typography, {
      variant: 'title',
      class: 'text-center text-4xl font-black',
      text: winner === 'player-two' ? ctx.t('game.winner') : ctx.t('game.loser'),
    }),
  ])

  return h(Box, { class: 'grid w-full flex-1 grid-cols-2 items-center' }, [playerOneSlot, playerTwoSlot])
}

const Draw = (input: Input) => {
  const humanSlot = h(Box, {}, [
    h(Avatar, { src: UserProfile.toAvatarUrl(input.ctx.profilesByUserId[input.ctx.currentUser.userId]) }),
  ])

  const botSlot = h(Box, {}, [h(IconRobot, { class: 'size-6' })])

  const playerOneSlot = h(Box, {}, [
    input.playerOne.renderIcon({
      class: 'h-5 w-5',
    }),
    input.human.player === 'player-one' ? humanSlot : botSlot,
  ])

  const playerTwoSlot = h(Box, {}, [
    input.playerTwo.renderIcon({
      class: 'h-5 w-5',
    }),
    input.human.player === 'player-two' ? humanSlot : botSlot,
  ])

  return h(Box, { class: 'flex flex-row h-full w-full flex-1 items-center justify-center' }, [
    h(Box, {}, [playerOneSlot, playerTwoSlot]),
    h(Box, {}, [Text({ text: 'Tie' })]),
  ])
}

export const VsBotPlayerSection = ({ ctx, human, bot, playerOne, playerTwo, turn }: VsBotGameInput) => {
  const profile = ctx.profilesByUserId[human.userId]
  const humanSlot = h(Box, {}, [
    h(Avatar, { class: 'size-6', src: UserProfile.toAvatarUrl(profile) }),
    profile && h(Typography, { class: 'truncate', variant: 'body', text: ctx.t('username', profile.username) }),
  ])

  const botSlot = h(Box, {}, [
    bot.renderIcon({
      class: 'size-6 flex-shrink-0',
    }),
    h(Typography, { class: 'truncate', variant: 'body', text: bot.label }),
  ])

  return h(Box, { class: 'flex flex-row w-full items-center gap-3 px-3' }, [
    h(Box, { class: 'flex flex-row w-1/2 items-center justify-center overflow-hidden' }, [
      h(Slot, { active: turn === 'player-one' }, [
        h(Box, {}, [
          playerOne.renderIcon({
            class: 'size-6',
          }),
        ]),
        human.player === 'player-one' ? humanSlot : botSlot,
      ]),
    ]),
    h(Box, { class: 'flex flex-row w-1/2 items-center justify-center overflow-hidden' }, [
      h(Slot, { active: turn === 'player-two' }, [
        playerTwo.renderIcon({
          class: 'size-6',
        }),
        human.player === 'player-two' ? humanSlot : botSlot,
      ]),
    ]),
  ])
}

const Slot = ({ active, children }: { active: boolean; children?: VDom }) => {
  return h(
    Paper,
    {
      class: cn(
        'flex flex-row max-w-full flex-1 items-center gap-2 rounded-md bg-black p-2 text-sm transition-colors duration-200 ease-in-out',
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
