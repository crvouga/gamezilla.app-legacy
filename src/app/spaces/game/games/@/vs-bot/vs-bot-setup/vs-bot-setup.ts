import { TranslatedText } from '~/@/l18n'
import { Box } from '~/@/vdom/primitives/box'
import { Avatar } from '~/@/ui/avatar'
import { Button } from '~/@/ui/button'
import { Clickable, ClickablePaper } from '~/@/ui/clickable'
import { IconQuestionMark } from '~/@/ui/icon'
import { SurfaceHeader } from '~/@/ui/surface/surface-header'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'
import type { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { SurfaceLayout } from '~/app/@/ui/surface/layout/surface-layout'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { ScreenLayoutGameCoverArt } from '../../ui/screen-layout-game-cover-art'
import type { PlayerType, VsBotInput } from '../vs-bot'
import { Text } from '~/@/vdom/primitives/text'

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

  return h(Box, { class: 'flex flex-row w-full flex-1 flex-col' }, [
    h(ScreenLayoutGameCoverArt, {
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
        h(Box, { class: 'flex w-full flex-col gap-2 p-4' }, [
          h(Box, { class: 'grid w-full grid-cols-7' }, [
            h(PlayerIcons, { player: playerOneProp, ctx }),
            h(Box, { class: 'col-span-1 grid place-items-center' }, [
              h(Typography, {
                class: 'flex h-full flex-1 flex-col items-center justify-center text-3xl font-black',
                variant: 'title',
                text: ctx.t('game.vs'),
              }),
            ]),
            h(PlayerIcons, { player: playerTwoProp, ctx }),
          ]),

          h(Box, { class: 'grid w-full grid-cols-7' }, [
            h(PlayerLabels, { player: playerOneProp, ctx }),
            h(Box, { class: 'col-span-1' }),
            h(PlayerLabels, { player: playerTwoProp, ctx }),
          ]),

          h(Box, { class: 'mt-2 grid w-full grid-cols-7' }, [
            h(PlayerButtons, {
              onSwapSides,
              dispatch,
              human,
              player: playerOneProp,
              ctx,
            }),
            h(Box, { class: 'col-span-1' }),
            h(PlayerButtons, {
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
      h(Box, { class: 'flex flex-row items-center gap-4 p-4' }, [
        h(Button, {
          disabled: !canStartGame,
          variant: 'contained',
          color: 'primary',
          class: 'flex-1',
          onClick: onStartGame,
          text: ctx.t('game.start-game'),
        }),
      ]),

    h(SurfaceLayout, {
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
          h(SurfaceHeader, {
            ctx,
            title: ctx.t('game.change-bot'),
            onClose: () => dispatch({ t: 'closed-modal' }),
          }),
      },
      body: {
        render: () =>
          h(
            Box,
            {},
            botVariants.map((botLevel) => {
              const onClick = () => {
                botLevel.onSelect()
                dispatch({
                  t: 'closed-modal',
                })
              }
              return h(
                Clickable,
                {
                  key: botLevel.label,
                  class: 'flex flex-row w-full items-center gap-3 p-4 text-left text-xl font-bold',
                  onClick,
                },
                [
                  botLevel.renderIcon({
                    class: 'w-10 h-10',
                  }),
                  Text({ text: botLevel.label }),
                ],
              )
            }),
          ),
      },
    }),
  ])
}

const PlayerIcons = ({ player, ctx }: { ctx: SpaceFrontendCtx; player: PlayerProp }) => {
  return h(Box, { class: 'col-span-3 grid grid-cols-2 place-items-center' }, [
    player.t === 'bot'
      ? player.renderBotIcon({
          class: 'h-14 w-14',
        })
      : player.userId
        ? h(Avatar, {
            class: 'h-14 w-14',
            src: UserProfile.toAvatarUrl(ctx.profilesByUserId[player.userId]),
          })
        : h(
            ClickablePaper,
            {
              role: 'button',
              class: 'grid h-14 w-14 place-items-center overflow-hidden rounded-full',
              onClick: player.onStartPlaying,
            },
            [h(IconQuestionMark, { class: 'text-secondary h-10 w-10' })],
          ),
    player.renderIcon({
      class: 'w-14 h-14',
    }),
  ])
}

const PlayerLabels = ({ player, ctx }: { ctx: SpaceFrontendCtx; player: PlayerProp }) => {
  const profile = player.t === 'user' && player.userId ? ctx.profilesByUserId[player.userId] : null
  return h(Box, { class: 'col-span-3 grid grid-cols-2 place-items-center' }, [
    h(Typography, {
      variant: 'label',
      color: 'text-secondary',
      class: 'w-full overflow-hidden text-center text-sm text-ellipsis whitespace-nowrap',
      text: player.t === 'bot' ? player.botLabel : profile ? ctx.t('username', profile.username) : ctx.t('?'),
    }),
    h(Typography, {
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
  return h(Box, { class: 'col-span-3 flex flex-col gap-2' }, [
    !human.userId &&
      h(Button, {
        onClick: player.onStartPlaying,
        class: 'w-full',
        color: 'primary',
        text: ctx.t('game.start-playing'),
      }),
    player.t === 'user' &&
      ctx.currentUser.userId === player.userId &&
      h(Button, {
        onClick: player.onStopPlaying,
        class: 'w-full',
        variant: 'text',
        color: 'primary',
        text: ctx.t('game.stop-playing'),
      }),
    player.t === 'bot' &&
      human.userId === ctx.currentUser.userId &&
      h(Button, {
        onClick: onSwapSides,
        class: 'w-full',
        variant: 'text',
        color: 'primary',
        text: ctx.t('game.swap-sides'),
      }),
    player.t === 'bot' &&
      human.userId === ctx.currentUser.userId &&
      h(Button, {
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
