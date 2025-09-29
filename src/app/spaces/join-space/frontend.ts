import { withEventMeta } from '~/@/event-sourced/event'
import { Translator } from '~/@/l18n/generated'
import { IPlatform } from '~/@/platform/platform'
import { IconArrowRightOnRect } from '~/@/ui/icon'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'
import { sx } from '~/@/vdom/style/sx'
import { andThen } from '~/app/@/frontend/and-then'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ReplaceScreenCmd } from '~/app/@/frontend/replace-screen-cmd.$msg'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd.$msg'
import { FloatingLayout } from '~/app/@/ui/floating/layout/floating-layout'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { SectionTitle } from '~/app/@/ui/section/section-title'
import { SpaceFrontendCtx } from '../@/frontend/ctx'
import { GotSpaceMsg } from '../@/got-space-msg.$msg'
import { SectionPeopleList } from '../@/ui/section-people-list'
import { SectionPersonDetails } from '../@/ui/section-person-details'
import { GameName } from '../game/games/@/game-name'
import { GameCoverArt } from '../game/games/cover-art'
import { CurrentUserSpaceLoader } from '../space/current-user-space-loader'
import { MsgSpace } from '../space/msg-space'
import { Space } from '../space/space'
import { FrontendCtxModule, ModelFrontend } from '../types'
import { isMsgFrontend, MsgFrontend } from './types'

const update = <T extends ModelFrontend>(input: {
  ctx: FrontendCtxModule
  model: T
  msg?: unknown
  msgIn?: unknown
}): {
  model: T
  msgOut?: unknown[]
} => {
  return andThen<T, MsgFrontend>(
    input,
    (model) => updateFromMsgSpace({ ...input, model }),
    (model) => updateFromJoinSpaceButton({ ...input, model }),
  )
}

const updateFromJoinSpaceButton: typeof update = (input) => {
  if (!isMsgFrontend(input.msg)) return input

  switch (input.msg?.t) {
    case 'joinSpace_clickedPersonMenuItem': {
      const isOpen = input.model.spaces_opened === 'join-space.person-preview-surface'
      if (isOpen) {
        return {
          model: { ...input.model, spaces_opened: null },
          msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
        }
      }
      return {
        model: { ...input.model, spaces_opened: 'join-space.person-preview-surface' },
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
      }
    }
    case 'joinSpace_submittedJoinSpaceForm': {
      if (!input.ctx.currentUser?.userId) return input

      return {
        model: input.model,
        msgOut: [
          GotSpaceMsg.init(
            withEventMeta<MsgSpace>({
              t: 'user-joined-space',
              spaceId: input.msg.spaceId,
              userId: input.ctx.currentUser.userId,
            }),
          ),
        ],
      }
    }
    case 'joinSpace_closedPersonItemSurface': {
      if (input.model.spaces_opened === 'join-space.person-preview-surface') {
        return { model: { ...input.model, spaces_opened: null }, msgOut: [PlaySoundCmd.init(APP_SOUND.tap)] }
      }
      return input
    }

    case 'joinSpace_openedPersonDetails': {
      return {
        model: input.model,
        msgOut: [PushScreenCmd.init({ n: 'profile', t: 'profile_profile', userId: input.msg.userId }, true)],
      }
    }

    case 'joinSpace_clickedBackButton': {
      return {
        model: input.model,
        msgOut: [ReplaceScreenCmd.init({ n: 'spaces', t: 'spaces_list' }, true)],
      }
    }
  }
}

const updateFromMsgSpace: typeof update = (input) => {
  if (!GotSpaceMsg.is(input.msgIn)) return input

  const msgSpace = input.msgIn.c

  switch (msgSpace.t) {
    case 'user-joined-space': {
      const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

      if (!currentUserSpace) return input

      const currentUserSpaceId = Space.toSpaceId(currentUserSpace)

      if (msgSpace.spaceId !== currentUserSpaceId) return input

      if (msgSpace.userId !== input.ctx.currentUser?.userId) {
        const username = input.ctx.profilesByUserId[msgSpace.userId]?.username ?? null
        return {
          model: input.model,
          msgOut: [
            PlaySoundCmd.init(APP_SOUND.navForward),
            username
              ? ShowToastCmd.init(input.ctx.t('spaces.other-user-joined-space', username))
              : ShowToastCmd.init(input.ctx.t('spaces.current-user-joined-space')),
          ],
        }
      }

      return {
        model: input.model,
        msgOut: [
          PlaySoundCmd.init(APP_SOUND.navForward),
          ShowToastCmd.init(input.ctx.t('spaces.current-user-joined-space')),
        ],
      }
    }
  }
  return input
}

const view = (input: { ctx: FrontendCtxModule; dispatch: (msg: MsgFrontend) => void; model: ModelFrontend }) => {
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
          space.game && h(SectionGame, { ctx: input.ctx, gameName: space.game.t }),

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

const SectionGame = (props: {
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

export const JoinSpaceFrontend = {
  view,
  update,
}
