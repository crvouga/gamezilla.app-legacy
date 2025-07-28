import { Avatar } from '~/@/ui/avatar'
import { Box } from '~/@/vdom/primitives/box'
import { Clickable } from '~/@/ui/clickable'
import { cn } from '~/@/ui/cn'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { VDom } from '~/@/vdom/vdom'
import { UserProfile } from '~/app/@/data/user-profile'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { ViewYouChip } from '~/app/spaces/@/ui/you-chip'
import { GameCoverArt } from '~/app/spaces/game/games/cover-art'
import { ViewHostChip } from '../../@/ui/host-chip'
import { GameName } from '../../game/games/@/game-name'
import { SpaceProjectionStarted } from '../../space/space-projection'
import { SPACE_CARD_GRADIENT_CLASS_NAME } from './space-card-gradient'

const MAX_AVATAR_COUNT = 3

export const ViewSpaceCard = (input: {
  ctx: AppFrontendCtxBase
  state: SpaceProjectionStarted
  onPress?: () => void
  key?: unknown
}) => {
  const host = input.ctx.profilesByUserId[input.state.hostId]
  const users = Object.values(input.state.users).flatMap((userId): UserProfile[] => {
    const profile = input.ctx.profilesByUserId[userId]
    if (!profile) return []
    return [profile]
  })

  return h(ViewRoot, { onPress: input.onPress }, [
    h(ViewLiveIndicator, { ctx: input.ctx }),
    h(ViewSpaceCardGame, { gameName: input.state.game?.t ?? null, ctx: input.ctx }),
    h(ViewSpaceCardHost, { host, ctx: input.ctx }),
    h(ViewSpaceCardUsers, { users, ctx: input.ctx }),
  ])
}

const ViewRoot = (input: { onPress?: () => void; children?: VDom }) => {
  const class_ = cn(
    SPACE_CARD_GRADIENT_CLASS_NAME,
    'flex w-full shrink-0 flex-col gap-3 overflow-hidden rounded-md bg-gradient-to-tr p-4',
  )
  if (typeof input.onPress === 'function') {
    return h(Clickable, { onPress: input.onPress, disabled: !input.onPress, class: class_ }, [input.children])
  }
  return h(Box, { class: class_ }, [input.children])
}

const ViewLiveIndicator = (input: { ctx: AppFrontendCtxBase }) => {
  return h(Box, { class: 'flex flex-row items-center justify-start gap-2' }, [
    h(Typography, {
      variant: 'label',
      class: 'block flex-1 text-left text-lg font-bold text-white uppercase',
      text: input.ctx.t('space-card.live'),
    }),
  ])
}

const ViewSpaceCardGame = (input: { gameName: GameName | null; ctx: AppFrontendCtxBase }) => {
  if (!input.gameName) return null

  return h(Box, { class: 'flex flex-row items-center justify-start gap-2' }, [
    h(GameCoverArt, { rounded: true, class: 'size-12', gameName: input.gameName, platform: input.ctx.platform }),
    h(Typography, { variant: 'body', class: 'truncate text-lg font-normal', text: input.ctx.t(input.gameName) }),
  ])
}

const ViewSpaceCardHost = (input: { host?: UserProfile | null; ctx: AppFrontendCtxBase }) => {
  return h(Box, { class: 'flex flex-row max-w-full items-center justify-start gap-2 overflow-x-hidden' }, [
    h(Avatar, { src: UserProfile.toAvatarUrl(input.host), alt: 'avatar', class: 'size-12' }),
    h(Box, { class: 'flex flex-row flex-1 items-center justify-start gap-2 overflow-x-hidden' }, [
      input.host &&
        h(Typography, {
          variant: 'body',
          class: 'truncate text-left text-lg font-normal',
          text: input.ctx.t('username', input.host.username),
        }),
      h(ViewHostChip, { ctx: input.ctx }),
    ]),
    input.ctx.currentUser?.userId === input.host?.id && h(ViewYouChip, { ctx: input.ctx }),
  ])
}

const ViewSpaceCardUsers = (input: { users: UserProfile[]; ctx: AppFrontendCtxBase }) => {
  if (input.users.length <= 1) return null

  return h(Box, { class: 'flex flex-row items-center justify-start gap-2' }, [
    h(Box, { class: 'flex flex-row items-center' }, [
      ...input.users.slice(0, MAX_AVATAR_COUNT).map((user, index) =>
        h(Avatar, {
          key: user.username,
          src: UserProfile.toAvatarUrl(user),
          alt: 'avatar',
          class: cn('h-8 w-8', index !== 0 && '-ml-2'),
        }),
      ),
      input.users.length > MAX_AVATAR_COUNT &&
        h(Box, { class: '-ml-2 flex flex-row h-8 w-8 items-center justify-center rounded-full bg-white/30' }, [
          h(Typography, { variant: 'label', text: input.ctx.t('app.+number', input.users.length - MAX_AVATAR_COUNT) }),
        ]),
    ]),
    h(Typography, {
      variant: 'body',
      class: 'truncate text-lg font-normal',
      text: input.ctx.t('space-card.people-count', input.users.length),
    }),
  ])
}
