import { Avatar } from '~/@/ui/avatar'
import { Clickable } from '~/@/ui/clickable'
import { IconXMark } from '~/@/ui/icon'
import { IconButton } from '~/@/ui/icon-button'
import { theme } from '~/@/ui/theme/theme'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { SpaceId } from '~/app/@/data/space-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { GameCoverArt } from '../../game/games/cover-art'
import { CurrentUserSpaceLoader } from '../../space/current-user-space-loader'
import { Space } from '../../space/space'
import { SpaceProjectionStarted } from '../../space/space-projection'
import type { ModelFrontend, MsgFrontend } from '../../types'
import type { SpaceFrontendModule } from '../space-frontend'
import { VDom } from '~/@/vdom/vdom'

const update: SpaceFrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'current-space-bar.clicked-current-space-bottom-bar': {
      if (!input.ctx.currentUser?.userId) return { model: input.model }

      const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

      if (!currentUserSpace) return { model: input.model }

      const currentUsersSpaceId = Space.toSpaceId(currentUserSpace)

      if (!currentUsersSpaceId) return { model: input.model }

      return {
        model: input.model,
        msgOut: [
          PlaySoundCmd.init(APP_SOUND.navForwardMin),
          PushScreenCmd.init({ n: 'spaces', t: 'space', spaceId: currentUsersSpaceId }),
        ],
      }
    }
  }
  return { model: input.model }
}

const ViewSpaceInfo = (props: { hostProfile: UserProfile | undefined; userCount: number; ctx: AppFrontendCtx }) => {
  return h(
    Box,
    {
      style: theme({
        flexDirection: 'col',
        flex: 1,
        gap: 2,
        overflow: 'hidden',
        paddingY: 3,
        paddingRight: 3,
      }),
    },
    [
      h(Typography, {
        variant: 'body',
        style: theme({
          textAlign: 'left',
          fontSize: 'lg',
          fontWeight: 'normal',
        }),
        text: props.hostProfile
          ? props.ctx.t('spaces.current-space', {
              hostUsername: props.hostProfile.username,
            })
          : props.ctx.t('spaces.space'),
      }),
      h(Typography, {
        variant: 'subtitle',
        style: theme({
          textAlign: 'left',
          fontSize: 'sm',
          fontWeight: 'normal',
        }),
        text: props.ctx.t('space-card.people-count', props.userCount),
      }),
    ],
  )
}

const ViewSpaceImage = (props: {
  space: SpaceProjectionStarted
  hostProfile: UserProfile | undefined
  ctx: AppFrontendCtx
}) => {
  if (!props.space.game)
    return h(Avatar, {
      src: props.hostProfile ? UserProfile.toAvatarUrl(props.hostProfile) : '',
      alt: 'Host Avatar',
      style: theme({ size: 16 }),
    })

  return h(GameCoverArt, {
    rounded: true,
    style: theme({ size: 16 }),
    gameName: props.space.game.t,
    platform: props.ctx.platform,
  })
}

const ViewActionButton = (props: {
  isCurrentUserHost: boolean
  spaceId: SpaceId
  ctx: AppFrontendCtx
  dispatch: (msg: MsgFrontend) => void
}) => {
  return h(Box, { style: theme({ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }) }, [
    props.isCurrentUserHost
      ? h(IconButton, {
          renderIcon: (iconInput) => h(IconXMark, iconInput),
          label: props.ctx.t('spaces.end'),
          size: 'lg',
          onPress: () => props.dispatch({ t: 'end-space.clicked-end-space-button', spaceId: props.spaceId }),
        })
      : h(IconButton, {
          renderIcon: (iconInput) => h(IconXMark, iconInput),
          label: props.ctx.t('spaces.leave'),
          size: 'lg',
          onPress: () => props.dispatch({ t: 'leave-space.clicked-leave-space-button', spaceId: props.spaceId }),
        }),
  ])
}

const ViewRoot = (input: { children: VDom[] }) => {
  return h(
    Box,
    {
      style: theme({
        flexDirection: 'row',
        overflow: 'hidden',
        rounded: 'lg',
        minWidth: '5xl',
        width: 'full',
        backgroundColor: 'blue-600',
      }),
    },
    input.children,
  )
}

const View = (input: {
  key?: string
  ctx: AppFrontendCtx
  model: ModelFrontend
  dispatch: (msg: MsgFrontend) => void
}) => {
  const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)
  const space = Space.toSpaceStarted(currentUserSpace)
  if (!space) return null

  const hostProfile = input.ctx.profilesByUserId[space.hostId]
  const userCount = Object.values(space.users).length
  const isCurrentUserHost = input.ctx.currentUser.userId === space.hostId

  return h(ViewRoot, {}, [
    h(
      Clickable,
      {
        role: 'button',
        style: theme({
          flexDirection: 'row',
          flex: 1,
          overflow: 'hidden',
          rounded: 'lg',
          alignItems: 'center',
          gap: 4,
        }),
        onPress: () => input.dispatch({ t: 'current-space-bar.clicked-current-space-bottom-bar' }),
      },
      [
        h(ViewSpaceImage, {
          space,
          hostProfile,
          ctx: input.ctx,
        }),
        h(ViewSpaceInfo, {
          hostProfile,
          userCount,
          ctx: input.ctx,
        }),
      ],
    ),
    h(ViewActionButton, {
      isCurrentUserHost,
      spaceId: space.spaceId,
      ctx: input.ctx,
      dispatch: input.dispatch,
    }),
  ])
}

export const CurrentSpaceMiniPlayer = {
  update,
  View,
}
