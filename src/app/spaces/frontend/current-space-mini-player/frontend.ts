import { Avatar } from '~/@/ui/avatar'
import { cn } from '~/@/ui/cn'
import { IconXMark } from '~/@/ui/icon'
import { IconButton } from '~/@/ui/icon-button'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { UserProfile } from '~/app/@/data/user-profile'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { GameCoverArt } from '../../game/games/cover-art'
import { SPACE_CARD_GRADIENT_CLASS_NAME } from '../../list-spaces/space-card/space-card-gradient'
import { CurrentUserSpaceLoader } from '../../space/current-user-space-loader'
import { Space } from '../../space/space'
import type { ModelFrontend, MsgFrontend } from '../../types'
import type { SpaceFrontendModule } from '../space-frontend'

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
  return h(
    Box,
    {
      class: cn(
        'flex w-full flex-row items-center justify-center overflow-hidden rounded-lg text-inherit',
        SPACE_CARD_GRADIENT_CLASS_NAME,
        'rounded-lg',
      ),
    },
    [
      h(
        Pressable,
        {
          type: 'button',
          class: 'flex flex-1 items-center gap-3 overflow-hidden',
          onClick: () => input.dispatch({ t: 'current-space-bar.clicked-current-space-bottom-bar' }),
        },
        [
          h(Box, { class: 'p-2' }, [
            space.game
              ? h(GameCoverArt, { rounded: true, class: 'size-14', gameName: space.game.t })
              : h(Avatar, {
                  src: hostProfile ? UserProfile.toAvatarUrl(hostProfile) : '',
                  alt: 'Host Avatar',
                  class: 'size-14',
                }),
          ]),

          h(Box, { class: 'flex flex-1 flex-col gap-0.5 overflow-hidden py-3 pr-3' }, [
            h(Typography, {
              variant: 'title',
              class: 'truncate text-left text-lg font-normal',
              text: hostProfile
                ? input.ctx.t('spaces.current-space', {
                    hostUsername: hostProfile.username,
                  })
                : input.ctx.t('spaces.space'),
            }),
            h(Typography, {
              variant: 'subtitle',
              class: 'truncate text-left',
              text: input.ctx.t('space-card.people-count', userCount),
            }),
          ]),
        ],
      ),

      h(
        Box,
        { class: 'pr-4' },
        [
          isCurrentUserHost &&
            h(IconButton, {
              renderIcon: (iconInput) => h(IconXMark, iconInput),
              label: input.ctx.t('spaces.end'),
              onClick: () => input.dispatch({ t: 'end-space.clicked-end-space-button', spaceId: space.spaceId }),
            }),

          !isCurrentUserHost &&
            h(IconButton, {
              renderIcon: (iconInput) => h(IconXMark, iconInput),
              label: input.ctx.t('spaces.leave'),
              onClick: () => input.dispatch({ t: 'leave-space.clicked-leave-space-button', spaceId: space.spaceId }),
            }),
        ].filter(Boolean),
      ),
    ],
  )
}

export const CurrentSpaceMiniPlayer = {
  update,
  View,
}
