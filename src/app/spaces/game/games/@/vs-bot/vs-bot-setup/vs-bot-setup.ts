import { TranslatedText } from '~/@/l18n'
import { Avatar } from '~/@/ui/avatar'
import { Button } from '~/@/ui/button'
import { ClickablePaper } from '~/@/ui/clickable'
import { IconQuestionMark } from '~/@/ui/icon'
import { SurfaceHeader } from '~/@/ui/surface/surface-header'
import { Typography } from '~/@/ui/typography'
import { v } from '~/@/vdom/v'
import type { VDom } from '~/@/vdom/vdom'
import type { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { SurfaceLayout } from '~/app/@/ui/surface/layout/surface-layout'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { ScreenLayoutGameCoverArt } from '../../ui/screen-layout-game-cover-art'
import type { PlayerType, VsBotInput } from '../vs-bot'

//
//
//
// Model
//
//
//

type Opened = 'change-bot'

export type Model = {
  opened: Opened | null
}

export const init: Model = {
  opened: null,
}

//
//
//
// Msg
//
//
//

export type Msg = { t: 'clicked-change-bot' } | { t: 'closed-modal' }

export const update = (model: Model, msg: Msg): Model => {
  switch (msg.t) {
    case 'clicked-change-bot': {
      return {
        ...model,
        opened: 'change-bot',
      }
    }

    case 'closed-modal': {
      return {
        ...model,
        opened: null,
      }
    }
  }
}

//
//
//
// View
//
//
//

type PlayerProp =
  | {
      t: 'user'
      userId: UserId | null
      playerLabel: TranslatedText
      renderIcon: (input: { class: string }) => VDom
      onStartPlaying: () => void
      onStopPlaying: () => void
    }
  | {
      t: 'bot'

      botLabel: TranslatedText
      renderBotIcon: (input: { class: string }) => VDom
      playerLabel: TranslatedText
      renderIcon: (input: { class: string }) => VDom
      onStartPlaying: () => void
      onStopPlaying: () => void
    }

export type VsBotSetupInput = VsBotInput & {
  human: {
    player: PlayerType
    userId: UserId | null
  }
  canStartGame: boolean
}

type Input = VsBotSetupInput & { model: Model; dispatch: (m: Msg) => void }

export const View = ({
  dispatch,
  model,
  botVariants,
  title,
  renderCoverArt,
  onQuit,
  ctx,
  human,
  bot,
  playerOne,
  playerTwo,
  canStartGame,
  onStartGame,
  onSwapSides,
}: Input) => {
  const playerOneProp: PlayerProp =
    human.player === 'player-one'
      ? {
          ...playerOne,
          t: 'user',
          userId: human.userId,
          playerLabel: playerOne.label,
        }
      : {
          ...playerOne,
          t: 'bot',
          botLabel: bot.label,
          playerLabel: playerOne.label,
          renderBotIcon: bot.renderIcon,
        }

  const playerTwoProp: PlayerProp =
    human.player === 'player-two'
      ? {
          ...playerTwo,
          t: 'user',
          userId: human.userId,
          playerLabel: playerTwo.label,
        }
      : {
          ...playerTwo,
          t: 'bot',
          botLabel: bot.label,
          playerLabel: playerTwo.label,
          renderBotIcon: bot.renderIcon,
        }

  return v('div', { class: 'flex w-full flex-1 flex-col' }, [
    v(ScreenLayoutGameCoverArt, {
      id: 'vs-bot-setup',
      parentScreen: ctx.parentScreen,
      ctx,
      navBar: {
        title,
        back: {
          onClick: onQuit,
        },
      },
      renderCoverArt,
      renderBody: () =>
        v('div', { class: 'flex w-full flex-col gap-2 p-4' }, [
          v('div', { class: 'grid w-full grid-cols-7' }, [
            v(PlayerIcons, { player: playerOneProp, ctx }),
            v('div', { class: 'col-span-1 grid place-items-center' }, [
              v(Typography, {
                class: 'flex h-full flex-1 flex-col items-center justify-center text-3xl font-black',
                variant: 'title',
                text: ctx.t('game.vs'),
              }),
            ]),
            v(PlayerIcons, { player: playerTwoProp, ctx }),
          ]),

          v('div', { class: 'grid w-full grid-cols-7' }, [
            v(PlayerLabels, { player: playerOneProp, ctx }),
            v('div', { class: 'col-span-1' }),
            v(PlayerLabels, { player: playerTwoProp, ctx }),
          ]),

          v('div', { class: 'mt-2 grid w-full grid-cols-7' }, [
            v(PlayerButtons, {
              onSwapSides,
              dispatch,
              human,
              player: playerOneProp,
              ctx,
            }),
            v('div', { class: 'col-span-1' }),
            v(PlayerButtons, {
              onSwapSides,
              dispatch,
              human,
              player: playerTwoProp,
              ctx,
            }),
          ]),
        ]),
    }),

    ctx.currentUser.userId === ctx.space.hostId &&
      v('div', { class: 'flex items-center gap-4 p-4' }, [
        v(Button, {
          disabled: !canStartGame,
          variant: 'contained',
          color: 'primary',
          class: 'flex-1',
          onClick: onStartGame,
          text: ctx.t('game.start-game'),
        }),
      ]),

    v(SurfaceLayout, {
      ctx,
      ariaLabel: ctx.t('game.change-bot'),
      drawer: {
        position: 'bottom',
      },
      id: 'change-bot',
      open: model.opened === 'change-bot',
      onClose: () =>
        dispatch({
          t: 'closed-modal',
        }),
      header: {
        render: () =>
          v(SurfaceHeader, {
            ctx,
            title: ctx.t('game.change-bot'),
            onClose: () => dispatch({ t: 'closed-modal' }),
          }),
      },
      body: {
        render: () =>
          v('div', {}, [
            botVariants.map((botLevel) => {
              const onClick = () => {
                botLevel.onSelect()
                dispatch({
                  t: 'closed-modal',
                })
              }
              return v(
                'button',
                {
                  key: botLevel.label,
                  class: 'flex w-full items-center gap-3 p-4 text-left text-xl font-bold',
                  onClick,
                },
                [
                  botLevel.renderIcon({
                    class: 'w-10 h-10',
                  }),
                  botLevel.label,
                ],
              )
            }),
          ]),
      },
    }),
  ])
}

const PlayerIcons = ({ player, ctx }: { ctx: SpaceFrontendCtx; player: PlayerProp }) => {
  return v('div', { class: 'col-span-3 grid grid-cols-2 place-items-center' }, [
    player.t === 'bot'
      ? player.renderBotIcon({
          class: 'h-14 w-14',
        })
      : player.userId
        ? v(Avatar, {
            class: 'h-14 w-14',
            src: UserProfile.toAvatarUrl(ctx.profilesByUserId[player.userId]),
          })
        : v(
            ClickablePaper,
            {
              role: 'button',
              class: 'grid h-14 w-14 place-items-center overflow-hidden rounded-full',
              onClick: player.onStartPlaying,
            },
            [v(IconQuestionMark, { class: 'text-secondary h-10 w-10' })],
          ),
    player.renderIcon({
      class: 'w-14 h-14',
    }),
  ])
}

const PlayerLabels = ({ player, ctx }: { ctx: SpaceFrontendCtx; player: PlayerProp }) => {
  const profile = player.t === 'user' && player.userId ? ctx.profilesByUserId[player.userId] : null
  return v('div', { class: 'col-span-3 grid grid-cols-2 place-items-center' }, [
    v(Typography, {
      variant: 'label',
      color: 'text-secondary',
      class: 'w-full overflow-hidden text-center text-sm text-ellipsis whitespace-nowrap',
      text: player.t === 'bot' ? player.botLabel : profile ? ctx.t('username', profile.username) : ctx.t('?'),
    }),
    v(Typography, {
      color: 'text-secondary',
      variant: 'label',
      class: 'text-center text-sm',
      text: player.playerLabel,
    }),
  ])
}

const PlayerButtons = ({
  human,
  player,
  ctx,
  onSwapSides,
  dispatch,
}: {
  onSwapSides: () => void
  human: { userId: UserId | null }
  ctx: SpaceFrontendCtx
  player: PlayerProp
  dispatch: (m: Msg) => void
}) => {
  return v('div', { class: 'col-span-3 flex flex-col gap-2' }, [
    !human.userId &&
      v(Button, {
        onClick: player.onStartPlaying,
        class: 'w-full',
        color: 'primary',
        text: ctx.t('game.start-playing'),
      }),
    player.t === 'user' &&
      ctx.currentUser.userId === player.userId &&
      v(Button, {
        onClick: player.onStopPlaying,
        class: 'w-full',
        variant: 'text',
        color: 'primary',
        text: ctx.t('game.stop-playing'),
      }),
    player.t === 'bot' &&
      human.userId === ctx.currentUser.userId &&
      v(Button, {
        onClick: onSwapSides,
        class: 'w-full',
        variant: 'text',
        color: 'primary',
        text: ctx.t('game.swap-sides'),
      }),
    player.t === 'bot' &&
      human.userId === ctx.currentUser.userId &&
      v(Button, {
        onClick: () =>
          dispatch({
            t: 'clicked-change-bot',
          }),
        class: 'w-full',
        variant: 'text',
        color: 'primary',
        text: ctx.t('game.change-bot'),
      }),
  ])
}
