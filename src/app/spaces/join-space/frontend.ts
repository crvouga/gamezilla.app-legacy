import { Eff } from '~/@/eff'
import { withEventMeta } from '~/@/event-sourced/event'
import { Translator } from '~/@/l18n/generated'
import { IPlatform } from '~/@/platform/platform'
import { Sub } from '~/@/sub'
import { IconArrowRightOnRect } from '~/@/ui/icon'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'
import { sx } from '~/@/vdom/style/sx'
import { SpaceId } from '~/app/@/data/space-id'
import { UserId } from '~/app/@/data/user-id'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { pushScreen, replaceScreen } from '~/app/frontend/current-screen/current-screen-cmd'
import { SpaceFrontendCtx } from '../@/frontend/ctx'
import { SectionPeopleList } from '../@/ui/section-people-list'
import { SectionPersonDetails } from '../@/ui/section-person-details'
import { GameName } from '../game/games/@/game-name'
import { GameCoverArt } from '../game/games/cover-art'
import { CurrentUserSpaceLoader } from '../space/current-user-space-loader'
import { MsgSpace, spaceMsgs } from '../space/msg-space'
import { Space } from '../space/space'
import { FrontendCtxModule, ModelFrontend } from '../types'

export type Msg =
  | { t: 'joinSpace_submittedJoinSpaceForm'; spaceId: SpaceId }
  | { t: 'joinSpace_clickedPersonMenuItem'; userId: UserId }
  | { t: 'joinSpace_closedPersonItemSurface' }
  | { t: 'joinSpace_openedPersonDetails'; userId: UserId }
  | { t: 'joinSpace_clickedBackButton' }
  | { t: 'joinSpace_gotMsgSpace'; c: MsgSpace }

export const update = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  msg: Msg
}): {
  model: ModelFrontend
  eff?: Eff<Msg>
} => {
  switch (input.msg.t) {
    case 'joinSpace_clickedPersonMenuItem': {
      const isOpen = input.model.spaces_opened === 'join-space.person-preview-surface'
      if (isOpen) {
        return {
          model: { ...input.model, spaces_opened: null },
          eff: playSound(APP_SOUND.tap),
        }
      }
      return {
        model: { ...input.model, spaces_opened: 'join-space.person-preview-surface' },
        eff: playSound(APP_SOUND.tap),
      }
    }
    case 'joinSpace_submittedJoinSpaceForm': {
      const currentUser = input.ctx.currentUser
      const spaceId = input.msg.spaceId

      if (!currentUser) return input

      return {
        model: input.model,
        eff: () => {
          spaceMsgs.pub(
            withEventMeta<MsgSpace>({
              t: 'userJoinedSpace',
              spaceId,
              userId: currentUser.userId,
            }),
          )
        },
      }
    }
    case 'joinSpace_closedPersonItemSurface': {
      if (input.model.spaces_opened === 'join-space.person-preview-surface') {
        return {
          model: {
            ...input.model,
            spaces_opened: null,
          },
          eff: playSound(APP_SOUND.tap),
        }
      }
      return input
    }

    case 'joinSpace_openedPersonDetails': {
      const userId = input.msg.userId
      return {
        model: input.model,
        eff: pushScreen({ n: 'profile', t: 'profile_profile', userId }, true),
      }
    }

    case 'joinSpace_clickedBackButton': {
      return {
        model: input.model,
        eff: replaceScreen({ n: 'spaces', t: 'spaces_list' }, true),
      }
    }
    case 'joinSpace_gotMsgSpace': {
      const msgSpace = input.msg.c

      switch (msgSpace.t) {
        case 'userJoinedSpace': {
          const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

          if (!currentUserSpace) return input

          const currentUserSpaceId = Space.toSpaceId(currentUserSpace)

          if (msgSpace.spaceId !== currentUserSpaceId) return input

          if (msgSpace.userId !== input.ctx.currentUser?.userId) {
            const username = input.ctx.profilesByUserId[msgSpace.userId]?.username ?? null
            return {
              model: input.model,
              eff: Eff.batch([
                playSound(APP_SOUND.navForward),
                username
                  ? showToast(input.ctx.t('spaces.other-userJoinedSpace', username))
                  : showToast(input.ctx.t('spaces.current-userJoinedSpace')),
              ]),
            }
          }

          return {
            model: input.model,
            eff: Eff.batch([playSound(APP_SOUND.navForward), showToast(input.ctx.t('spaces.current-userJoinedSpace'))]),
          }
        }

        default: {
          return input
        }
      }
    }
  }
}

const joinSpaceMsgs = Sub.where(spaceMsgs, (msg) => msg.t === 'userJoinedSpace')

export const subscriptions = (_input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<Msg> => {
  return Sub.map(joinSpaceMsgs, (c): Msg => ({ t: 'joinSpace_gotMsgSpace', c }))
}

export const View = (input: { ctx: FrontendCtxModule; dispatch: (msg: Msg) => void; model: ModelFrontend }) => {
  const currentUser = input.ctx.currentUser

  if (!currentUser) return h(Text, { text: 'No current user' })

  const space = input.ctx.space

  if (!space) return h(Text, { text: 'No space' })

  const spaceCtx: SpaceFrontendCtx = { ...input.ctx, space, currentUser }
  const hostProfile = input.ctx.profilesByUserId[space.hostId]

  return h(ScreenLayout, {
    dataTestId: 'spaces/join-space',
    id: 'join-space',
    parentScreen: input.ctx.parentScreen,
    ctx: input.ctx,
    actionCreate: {
      onSubmit: () => input.dispatch({ t: 'joinSpace_submittedJoinSpaceForm', spaceId: space.spaceId }),
      submitText: input.ctx.t('spaces.join-space'),
      submitLoading: false,
      submitDisabled: false,
      submitIcon: (props) => h(IconArrowRightOnRect, props),
    },
    navBar: {
      title: hostProfile
        ? input.ctx.t('spaces.current-space', {
            hostUsername: hostProfile.username,
          })
        : null,
      back: {
        onPress: () => input.dispatch({ t: 'joinSpace_clickedBackButton' }),
      },
    },
    renderBody: () =>
      h(
        Box,
        {
          style: sx({
            flexDirection: 'col',
            width: 'full',
            gap: 6,
          }),
        },
        [
          space.game && h(ViewSectionGame, { ctx: input.ctx, gameName: space.game.t }),

          h(SectionPeopleList, {
            ctx: spaceCtx,
            onPressItem: (userId) => input.dispatch({ t: 'joinSpace_clickedPersonMenuItem', userId }),
            renderItem: (profile, vDom) =>
              h(FloatingLayout, {
                ctx: spaceCtx,
                ariaLabel: input.ctx.t('?'),
                open: input.model.spaces_opened === 'join-space.person-preview-surface',
                onClose: () => input.dispatch({ t: 'joinSpace_closedPersonItemSurface' }),
                drawer: {
                  position: 'bottom',
                },
                dropDown: {
                  position: 'bottom',
                  alignment: 'starting',
                  reference: {
                    render: () => vDom,
                  },
                },
                id: 'user-preview',
                body: {
                  render: () =>
                    h(SectionPersonDetails, {
                      onOpenDetails: () =>
                        input.dispatch({ t: 'joinSpace_openedPersonDetails', userId: profile.userId }),
                      ctx: spaceCtx,
                      profile: profile,
                    }),
                },
              }),
          }),
        ],
      ),
  })
}

const ViewSectionGame = (props: {
  ctx: {
    t: Translator
    platform: IPlatform
  }
  gameName: GameName
}) => {
  return h(
    Box,
    {
      style: sx({
        flexDirection: 'col',
        width: 'full',
        gap: 6,
        paddingTop: 12,
      }),
    },
    [
      h(SectionTitle, { text: props.ctx.t('spaces.game') }),

      h(
        Box,
        {
          style: sx({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingLeft: 12,
            paddingRight: 12,
          }),
        },
        [
          h(GameCoverArt, {
            rounded: true,
            style: sx({ size: 20 }),
            gameName: props.gameName,
            platform: props.ctx.platform,
          }),

          h(Typography, {
            variant: 'label',
            text: props.ctx.t(props.gameName),
            style: sx({ fontSize: 'lg' }),
          }),
        ],
      ),
    ],
  )
}
