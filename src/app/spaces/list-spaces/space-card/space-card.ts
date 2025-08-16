import { Avatar } from '~/@/ui/avatar'
import { Clickable } from '~/@/ui/clickable'
import { sx } from '~/@/vdom/style/sx'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { VDom } from '~/@/vdom/vdom'
import { UserProfile } from '~/app/@/data/user-profile'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { ViewYouChip } from '~/app/spaces/@/ui/you-chip'
import { GameCoverArt } from '~/app/spaces/game/games/cover-art'
import { ViewHostChip } from '../../@/ui/host-chip'
import { GameName } from '../../game/games/@/game-name'
import { SpaceProjectionStarted } from '../../space/space-projection'

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
  const style = sx({
    flexDirection: 'col',
    width: 'full',
    gap: 3,
    rounded: 'md',
    backgroundColor: 'blue-600',
    padding: 4,
  })

  if (typeof input.onPress === 'function') {
    return h(Clickable, { onPress: input.onPress, disabled: !input.onPress, style }, [input.children])
  }
  return h(Box, { style }, [input.children])
}

const ViewLiveIndicator = (input: { ctx: AppFrontendCtxBase }) => {
  return h(Box, { style: sx({ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 2 }) }, [
    h(Typography, {
      variant: 'label',
      style: sx({ flex: 1, textColor: 'white', fontWeight: 'bold', fontSize: 'lg' }),
      text: input.ctx.t('space-card.live'),
    }),
  ])
}

const ViewSpaceCardGame = (input: { gameName: GameName | null; ctx: AppFrontendCtxBase }) => {
  if (!input.gameName) return null

  return h(Box, { style: sx({ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 2 }) }, [
    h(GameCoverArt, {
      rounded: true,
      style: sx({ width: 12, height: 12 }),
      gameName: input.gameName,
      platform: input.ctx.platform,
    }),
    h(Typography, {
      variant: 'body',
      style: sx({ fontSize: 'lg', fontWeight: 'normal' }),
      text: input.ctx.t(input.gameName),
    }),
  ])
}

const ViewSpaceCardHost = (input: { host?: UserProfile | null; ctx: AppFrontendCtxBase }) => {
  return h(
    Box,
    {
      style: sx({ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 2, width: 'full' }),
    },
    [
      h(Avatar, { src: UserProfile.toAvatarUrl(input.host), alt: 'avatar', style: sx({ width: 12, height: 12 }) }),
      h(
        Box,
        { style: sx({ flexDirection: 'row', flex: 1, alignItems: 'center', justifyContent: 'flex-start', gap: 2 }) },
        [
          input.host &&
            h(Typography, {
              variant: 'body',
              style: sx({ fontSize: 'lg', fontWeight: 'normal' }),
              text: input.ctx.t('username', input.host.username),
            }),
          h(ViewHostChip, { ctx: input.ctx }),
        ],
      ),
      input.ctx.currentUser?.userId === input.host?.id && h(ViewYouChip, { ctx: input.ctx }),
    ],
  )
}

const ViewSpaceCardUsers = (input: { users: UserProfile[]; ctx: AppFrontendCtxBase }) => {
  if (input.users.length <= 1) return null

  return h(Box, { style: sx({ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 2 }) }, [
    h(Box, { style: sx({ flexDirection: 'row', alignItems: 'center' }) }, [
      ...input.users.slice(0, MAX_AVATAR_COUNT).map((user, index) =>
        h(Avatar, {
          key: user.username,
          src: UserProfile.toAvatarUrl(user),
          alt: 'avatar',
          style: sx({ width: 8, height: 8, ...(index !== 0 && { paddingLeft: -2 }) }),
        }),
      ),
      input.users.length > MAX_AVATAR_COUNT &&
        h(
          Box,
          {
            style: sx({
              paddingLeft: -2,
              flexDirection: 'row',
              width: 8,
              height: 8,
              alignItems: 'center',
              justifyContent: 'center',
              rounded: 'full',
              backgroundColor: 'white/30',
            }),
          },
          [
            h(Typography, {
              variant: 'label',
              text: input.ctx.t('app.+number', input.users.length - MAX_AVATAR_COUNT),
            }),
          ],
        ),
    ]),
    h(Typography, {
      variant: 'body',
      style: sx({ fontSize: 'lg', fontWeight: 'normal' }),
      text: input.ctx.t('space-card.people-count', input.users.length),
    }),
  ])
}
