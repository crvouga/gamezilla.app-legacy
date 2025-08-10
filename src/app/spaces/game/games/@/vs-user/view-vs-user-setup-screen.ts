import { TranslatedText } from '~/@/l18n'
import { Box } from '~/@/vdom/primitives/box'
import { Avatar } from '~/@/ui/avatar'
import { Button } from '~/@/ui/button'
import { ClickablePaper } from '~/@/ui/clickable'
import { IconQuestionMark } from '~/@/ui/icon'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'
import type { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { ScreenLayoutGameCoverArt } from '../ui/screen-layout-game-cover-art'
import { sx } from '~/@/ui/theme/theme'

type IconProps = { style: Record<string, unknown> }

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
  return h(Box, { style: sx({ flexDirection: 'col', width: 'full', gap: 2, padding: 4 }) }, [
    h(Box, { style: sx({ width: 'full', gap: 2 }) }, [
      h(Box, { style: sx({ flex: 3 }) }, [h(PlayerIcons, { player: playerOne, ctx })]),

      h(Box, { style: sx({ flex: 1 }) }, [
        h(Typography, {
          text: ctx.t('game.vs'),
          variant: 'title',
          style: sx({
            height: 'full',
            flex: 1,
            flexDirection: 'col',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3xl',
            fontWeight: 'black',
          }),
        }),
      ]),

      h(Box, { style: sx({ flex: 3 }) }, [h(PlayerIcons, { player: playerTwo, ctx })]),
    ]),

    h(Box, { style: sx({ width: 'full', gap: 2 }) }, [
      h(Box, { style: sx({ flex: 3 }) }, [h(PlayerLabels, { player: playerOne, ctx })]),

      h(Box, { style: sx({ flex: 1 }) }),

      h(Box, { style: sx({ flex: 3 }) }, [h(PlayerLabels, { player: playerTwo, ctx })]),
    ]),

    h(Box, { style: sx({ paddingTop: 2, width: 'full', gap: 2 }) }, [
      h(Box, { style: sx({ flex: 3 }) }, [h(PlayerButtons, { player: playerOne, ctx })]),

      h(Box, { style: sx({ flex: 1 }) }),

      h(Box, { style: sx({ flex: 3 }) }, [h(PlayerButtons, { player: playerTwo, ctx })]),
    ]),
  ])
}

export const VsUserSetup = {
  VersusSection,
}

const PlayerButtons = ({ player, ctx }: { ctx: SpaceFrontendCtx; player: PlayerProp }) => {
  return h(Box, { style: sx({ width: 'full' }) }, [
    player.userId &&
      player.userId === ctx.currentUser.userId &&
      h(Button, {
        width: 'full',
        variant: 'text',
        color: 'primary',
        onPress: player.onStopPlaying,
        text: ctx.t('game.stop-playing'),
      }),

    !player.userId &&
      h(Button, {
        width: 'full',
        variant: 'contained',
        color: 'primary',
        onPress: player.onStartPlaying,
        text: ctx.t('game.start-playing'),
      }),
  ])
}

const PlayerIcons = ({ player, ctx }: { ctx: SpaceFrontendCtx; player: PlayerProp }) => {
  return h(
    Box,
    {
      style: sx({
        width: 'full',
        justifyContent: 'center',
        gap: 2,
        textAlign: 'center',
      }),
      onPress: player.userId === ctx.currentUser.userId ? player.onStopPlaying : player.onStartPlaying,
    },
    [
      player.userId
        ? h(Avatar, {
            style: sx({ height: 14, width: 14 }),
            src: UserProfile.toAvatarUrl(ctx.profilesByUserId[player.userId]),
            alt: '',
          })
        : h(
            ClickablePaper,
            {
              role: 'button',
              style: sx({
                height: 14,
                width: 14,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                rounded: 'full',
              }),
              onPress: player.onStartPlaying,
            },
            [h(IconQuestionMark, { style: sx({ textColor: 'neutral-500', height: 10, width: 10 }) })],
          ),

      player.renderIcon({
        style: sx({ height: 14, width: 14 }),
      }),
    ],
  )
}

const PlayerLabels = ({ player, ctx }: { ctx: SpaceFrontendCtx; player: PlayerProp }) => {
  return h(
    Box,
    {
      style: sx({
        width: 'full',
        justifyContent: 'center',
        gap: 2,
        textAlign: 'center',
        fontSize: 'sm',
      }),
    },
    [
      h(Typography, {
        style: sx({
          flex: 1,
          overflow: 'hidden',
          textAlign: 'center',
        }),
        text: TranslatedText.of(player.userId ? (ctx.profilesByUserId[player.userId]?.username ?? '...') : '?'),
        variant: 'body',
        color: 'text-secondary',
      }),

      h(Typography, {
        color: 'text-secondary',
        style: sx({
          flex: 1,
          overflow: 'hidden',
          textAlign: 'center',
        }),
        text: player.label,
        variant: 'body',
      }),
    ],
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
  renderCoverArt: (props: { style: Record<string, unknown> }) => VDom
  playerOne: PlayerProp
  playerTwo: PlayerProp
  onStartGame: () => void
  onQuit: () => void
  canStartGame?: boolean
}) => {
  return h(
    Box,
    {
      style: sx({
        height: 'full',
        width: 'full',
        flex: 1,
        flexDirection: 'col',
        overflow: 'hidden',
      }),
    },
    [
      h(ScreenLayoutGameCoverArt, {
        id: 'vs-user-setup',
        parentScreen: ctx.parentScreen,
        ctx: ctx,
        navBar: {
          title,
          back: {
            onPress: onQuit,
          },
        },
        renderCoverArt: renderCoverArt,
        renderBody: () => h(VersusSection, { playerOne, playerTwo, ctx }),
      }),

      ctx.currentUser.userId === ctx.space.hostId &&
        h(
          Box,
          {
            style: sx({
              flexDirection: 'row',
              width: 'full',
              alignItems: 'center',
              gap: 4,
              padding: 4,
            }),
          },
          [
            h(Button, {
              width: 'full',
              disabled: !canStartGame,
              variant: 'contained',
              color: 'primary',
              style: sx({ flex: 1 }),
              onPress: onStartGame,
              text: ctx.t('game.start-game'),
            }),
          ],
        ),
    ],
  )
}
