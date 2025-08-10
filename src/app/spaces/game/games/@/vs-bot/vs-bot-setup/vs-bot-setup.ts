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
import { sx } from '~/@/ui/theme/theme'

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
      renderIcon: (input: { style: Record<string, unknown> }) => VDom
      onStartPlaying: () => void
      onStopPlaying: () => void
    }
  | {
      t: 'bot'

      botLabel: TranslatedText
      renderBotIcon: (input: { style: Record<string, unknown> }) => VDom
      playerLabel: TranslatedText
      renderIcon: (input: { style: Record<string, unknown> }) => VDom
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

  return h(Box, { style: sx({ flexDirection: 'col', width: 'full', flex: 1 }) }, [
    h(ScreenLayoutGameCoverArt, {
      id: 'vs-bot-setup',
      parentScreen: ctx.parentScreen,
      ctx,
      navBar: {
        title,
        back: {
          onPress: onQuit,
        },
      },
      renderCoverArt,
      renderBody: () =>
        h(Box, { style: sx({ flexDirection: 'col', width: 'full', gap: 2, padding: 4 }) }, [
          h(Box, { style: sx({ flexDirection: 'row', width: 'full', justifyContent: 'space-between' }) }, [
            h(PlayerIcons, { player: playerOneProp, ctx }),
            h(Box, { style: sx({ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }) }, [
              h(Typography, {
                style: sx({
                  flexDirection: 'col',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3xl',
                  fontWeight: 'black',
                }),
                variant: 'title',
                text: ctx.t('game.vs'),
              }),
            ]),
            h(PlayerIcons, { player: playerTwoProp, ctx }),
          ]),

          h(Box, { style: sx({ flexDirection: 'row', width: 'full', justifyContent: 'space-between' }) }, [
            h(PlayerLabels, { player: playerOneProp, ctx }),
            h(Box, { style: sx({ flex: 1 }) }),
            h(PlayerLabels, { player: playerTwoProp, ctx }),
          ]),

          h(Box, { style: sx({ flexDirection: 'row', width: 'full', justifyContent: 'space-between' }) }, [
            h(PlayerButtons, {
              onSwapSides,
              dispatch,
              human,
              player: playerOneProp,
              ctx,
            }),
            h(Box, { style: sx({ flex: 1 }) }),
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
      h(Box, { style: sx({ flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 }) }, [
        h(Button, {
          disabled: !canStartGame,
          variant: 'contained',
          color: 'primary',
          width: 'full',
          onPress: onStartGame,
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
              const onPress = () => {
                botLevel.onSelect()
                dispatch({
                  t: 'closed-modal',
                })
              }
              return h(
                Clickable,
                {
                  key: botLevel.label,
                  style: sx({
                    flexDirection: 'row',
                    width: 'full',
                    alignItems: 'center',
                    gap: 3,
                    padding: 4,
                    textAlign: 'left',
                    fontSize: 'xl',
                    fontWeight: 'bold',
                  }),
                  onPress,
                },
                [
                  botLevel.renderIcon({
                    style: sx({ width: 10, height: 10 }),
                  }),
                  h(Text, { text: botLevel.label }),
                ],
              )
            }),
          ),
      },
    }),
  ])
}

const PlayerIcons = ({ player, ctx }: { ctx: SpaceFrontendCtx; player: PlayerProp }) => {
  return h(Box, { style: sx({ flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 2 }) }, [
    player.t === 'bot'
      ? player.renderBotIcon({
          style: sx({ height: 14, width: 14 }),
        })
      : player.userId
        ? h(Avatar, {
            style: sx({ height: 14, width: 14 }),
            src: UserProfile.toAvatarUrl(ctx.profilesByUserId[player.userId]),
          })
        : h(
            ClickablePaper,
            {
              role: 'button',
              style: sx({
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                height: 14,
                width: 14,
                overflow: 'hidden',
                rounded: 'full',
              }),
              onPress: player.onStartPlaying,
            },
            [h(IconQuestionMark, { style: sx({ height: 10, width: 10, textColor: 'neutral-500' }) })],
          ),
    player.renderIcon({
      style: sx({ width: 14, height: 14 }),
    }),
  ])
}

const PlayerLabels = ({ player, ctx }: { ctx: SpaceFrontendCtx; player: PlayerProp }) => {
  const profile = player.t === 'user' && player.userId ? ctx.profilesByUserId[player.userId] : null
  return h(Box, { style: sx({ flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 2 }) }, [
    h(Typography, {
      variant: 'label',
      color: 'text-secondary',
      style: sx({
        width: 'full',
        overflow: 'hidden',
        textAlign: 'center',
        fontSize: 'sm',
      }),
      text: player.t === 'bot' ? player.botLabel : profile ? ctx.t('username', profile.username) : ctx.t('?'),
    }),
    h(Typography, {
      color: 'text-secondary',
      variant: 'label',
      style: sx({ textAlign: 'center', fontSize: 'sm' }),
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
  return h(Box, { style: sx({ flex: 1, flexDirection: 'col', gap: 2 }) }, [
    !human.userId &&
      h(Button, {
        onPress: player.onStartPlaying,
        width: 'full',
        color: 'primary',
        text: ctx.t('game.start-playing'),
      }),
    player.t === 'user' &&
      ctx.currentUser.userId === player.userId &&
      h(Button, {
        onPress: player.onStopPlaying,
        width: 'full',
        variant: 'text',
        color: 'primary',
        text: ctx.t('game.stop-playing'),
      }),
    player.t === 'bot' &&
      human.userId === ctx.currentUser.userId &&
      h(Button, {
        onPress: onSwapSides,
        width: 'full',
        variant: 'text',
        color: 'primary',
        text: ctx.t('game.swap-sides'),
      }),
    player.t === 'bot' &&
      human.userId === ctx.currentUser.userId &&
      h(Button, {
        onPress: () =>
          dispatch({
            t: 'clicked-change-bot',
          }),
        width: 'full',
        variant: 'text',
        color: 'primary',
        text: ctx.t('game.change-bot'),
      }),
  ])
}
