import { TranslatedText } from '~/@/l18n'
import { Avatar } from '~/@/ui/avatar'
import { Button } from '~/@/ui/button'
import { ClickablePaper } from '~/@/ui/clickable'
import { IconQuestionMark } from '~/@/ui/icon'
import { Typography } from '~/@/ui/typography'
import { v } from '~/@/vdom/v'
import type { VDom } from '~/@/vdom/vdom'
import type { UserId } from '~/app/@/data/user-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { ScreenLayoutGameCoverArt } from '../ui/screen-layout-game-cover-art'

type IconProps = { class: string }

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
  return v('div', { class: 'flex w-full flex-col gap-2 p-4' }, [
    v('div', { class: 'grid w-full grid-cols-7' }, [
      v(PlayerIcons, { player: playerOne, ctx }),

      v('div', { class: 'col-span-1' }, [
        v(Typography, {
          text: ctx.t('game.vs'),
          variant: 'title',
          class: 'flex h-full flex-1 flex-col items-center justify-center text-3xl font-black',
        }),
      ]),

      v(PlayerIcons, { player: playerTwo, ctx }),
    ]),

    v('div', { class: 'grid w-full grid-cols-7' }, [
      v(PlayerLabels, { player: playerOne, ctx }),

      v('div', { class: 'col-span-1' }),

      v(PlayerLabels, { player: playerTwo, ctx }),
    ]),

    v('div', { class: 'mt-2 grid w-full grid-cols-7' }, [
      v(PlayerButtons, { player: playerOne, ctx }),

      v('div', { class: 'col-span-1' }),

      v(PlayerButtons, { player: playerTwo, ctx }),
    ]),
  ])
}

export const VsUserSetup = {
  VersusSection,
}

const PlayerButtons = ({ player, ctx }: { ctx: SpaceFrontendCtx; player: PlayerProp }) => {
  return v('div', { class: 'col-span-3 w-full' }, [
    player.userId &&
      player.userId === ctx.currentUser.userId &&
      v(Button, {
        class: 'w-full',
        variant: 'text',
        color: 'primary',
        onClick: player.onStopPlaying,
        text: ctx.t('game.stop-playing'),
      }),

    !player.userId &&
      v(Button, {
        class: 'w-full',
        variant: 'contained',
        color: 'primary',
        onClick: player.onStartPlaying,
        text: ctx.t('game.start-playing'),
      }),
  ])
}

const PlayerIcons = ({ player, ctx }: { ctx: SpaceFrontendCtx; player: PlayerProp }) => {
  return v(
    'div',
    {
      class: 'col-span-3 grid w-full cursor-pointer grid-cols-2 place-items-center text-center',
      onClick: player.userId === ctx.currentUser.userId ? player.onStopPlaying : player.onStartPlaying,
    },
    [
      player.userId
        ? v(Avatar, {
            class: 'h-14 w-14',
            src: UserProfile.toAvatarUrl(ctx.profilesByUserId[player.userId]),
            alt: '',
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
        class: 'h-14 w-14',
      }),
    ],
  )
}

const PlayerLabels = ({ player, ctx }: { ctx: SpaceFrontendCtx; player: PlayerProp }) => {
  return v('div', { class: 'col-span-3 grid w-full grid-cols-2 place-items-center text-center text-sm' }, [
    v(Typography, {
      class: 'w-full overflow-hidden text-center text-ellipsis whitespace-nowrap',
      text: TranslatedText.of(player.userId ? (ctx.profilesByUserId[player.userId]?.username ?? '...') : '?'),
      variant: 'body',
      color: 'text-secondary',
    }),

    v(Typography, {
      color: 'text-secondary',
      class: 'w-full overflow-hidden text-center text-ellipsis whitespace-nowrap',
      text: player.label,
      variant: 'body',
    }),
  ])
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
  renderCoverArt: (props: { class: string }) => VDom
  playerOne: PlayerProp
  playerTwo: PlayerProp
  onStartGame: () => void
  onQuit: () => void
  canStartGame?: boolean
}) => {
  return v('div', { class: 'flex h-full w-full flex-1 flex-col overflow-hidden' }, [
    v(ScreenLayoutGameCoverArt, {
      id: 'vs-user-setup',
      parentScreen: ctx.parentScreen,
      ctx: ctx,
      navBar: {
        title,
        back: {
          onClick: onQuit,
        },
      },
      renderCoverArt: renderCoverArt,
      renderBody: () => v(VersusSection, { playerOne, playerTwo, ctx }),
    }),

    ctx.currentUser.userId === ctx.space.hostId &&
      v('div', { class: 'flex w-full items-center gap-4 p-4' }, [
        v(Button, {
          disabled: !canStartGame,
          variant: 'contained',
          color: 'primary',
          class: 'flex-1',
          onClick: onStartGame,
          text: ctx.t('game.start-game'),
        }),
      ]),
  ])
}
