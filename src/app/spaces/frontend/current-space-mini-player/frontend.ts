import { Eff } from '~/@/eff'
import { Avatar } from '~/@/ui/avatar'
import { Clickable } from '~/@/ui/clickable'
import { IconXMark } from '~/@/ui/icon'
import { IconButton } from '~/@/ui/icon-button'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { sx } from '~/@/vdom/style/sx'
import { VDom } from '~/@/vdom/vdom'
import { SpaceId } from '~/app/@/data/space-id'
import { UserProfile } from '~/app/@/data/user-profile'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { pushScreen } from '~/app/@/frontend/push-screen-cmd.$msg'
import { playSound } from '~/app/@/frontend/sound-cmd'
import { GameCoverArt } from '../../game/games/cover-art'
import { CurrentUserSpaceLoader } from '../../space/current-user-space-loader'
import { Space } from '../../space/space'
import { SpaceProjectionStarted } from '../../space/space-projection'
import type { FrontendCtxModule, ModelFrontend, MsgFrontend } from '../../types'

export type Msg = { t: 'currentSpaceMiniPlayer_clicked' }

export const update = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  msg: Msg
}): {
  model: ModelFrontend
  eff?: Eff<Msg>
} => {
  switch (input.msg.t) {
    case 'currentSpaceMiniPlayer_clicked': {
      if (!input.ctx.currentUser?.userId) return { model: input.model }

      const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

      if (!currentUserSpace) return { model: input.model }

      const currentUsersSpaceId = Space.toSpaceId(currentUserSpace)

      if (!currentUsersSpaceId) return { model: input.model }

      return {
        model: input.model,
        eff: Eff.batch([
          playSound(APP_SOUND.navForwardMin),
          pushScreen({ n: 'spaces', t: 'spaces_space', spaceId: currentUsersSpaceId }),
        ]),
      }
    }
  }
}

const ViewSpaceInfo = (props: { hostProfile: UserProfile | undefined; userCount: number; ctx: AppFrontendCtx }) => {
  return h(
    Box,
    {
      style: sx({
        flexDirection: 'col',
        flex: 1,
        overflow: 'hidden',
      }),
    },
    [
      h(Typography, {
        variant: 'body',
        style: sx({
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
        style: sx({
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
      style: sx({ size: 16 }),
    })

  return h(GameCoverArt, {
    rounded: true,
    style: sx({ size: 16 }),
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
  return h(Box, { style: sx({ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }) }, [
    props.isCurrentUserHost
      ? h(IconButton, {
          renderIcon: (iconInput) => h(IconXMark, iconInput),
          label: props.ctx.t('spaces.end'),
          size: 'lg',
          onPress: () =>
            props.dispatch({ t: 'endSpace', c: { n: 'endSpace', t: 'clickedEndSpaceButton', spaceId: props.spaceId } }),
        })
      : h(IconButton, {
          renderIcon: (iconInput) => h(IconXMark, iconInput),
          label: props.ctx.t('spaces.leave'),
          size: 'lg',
          onPress: () =>
            props.dispatch({ t: 'leaveSpace', c: { t: 'leaveSpace_clickedLeaveSpaceButton', spaceId: props.spaceId } }),
        }),
  ])
}

const ViewRoot = (input: { children: VDom[] }) => {
  return h(
    Box,
    {
      style: sx({
        flexDirection: 'row',
        overflow: 'hidden',
        rounded: 'lg',
        minWidth: 'xs',
        width: 'full',
        backgroundColor: 'blue-600',
      }),
    },
    input.children,
  )
}

export const View = (input: {
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
        style: sx({
          flexDirection: 'row',
          flex: 1,
          overflow: 'hidden',
          rounded: 'lg',
          alignItems: 'center',
          gap: 4,
        }),
        onPress: () => input.dispatch({ t: 'currentSpaceMiniPlayer', c: { t: 'currentSpaceMiniPlayer_clicked' } }),
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
      dispatch: (m) => input.dispatch({ t: 'currentSpaceMiniPlayer', c: m }),
    }),
  ])
}
