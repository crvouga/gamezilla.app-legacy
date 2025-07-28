import { withEventId } from '~/@/event-sourced/event'
import { Translator } from '~/@/l18n/generated'
import { IconArrowRightOnRect } from '~/@/ui/icon'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { SectionTitle } from '~/app/@/ui/section/section-title'
import { SurfaceLayout } from '~/app/@/ui/surface/layout/surface-layout'
import { SpaceFrontendCtx } from '../@/frontend/ctx'
import { SectionPeopleList } from '../@/ui/section-people-list'
import { SectionPersonDetails } from '../@/ui/section-person-details'
import { SpaceFrontendModule } from '../frontend/space-frontend'
import { GameName } from '../game/games/@/game-name'
import { GameCoverArt } from '../game/games/cover-art'
import { CurrentUserSpaceLoader } from '../space/current-user-space-loader'
import { MsgSpace } from '../space/msg-space'
import { Space } from '../space/space'
import { IPlatform } from '~/@/platform/platform'

const update: SpaceFrontendModule['update'] = (input) => {
  return SpaceFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromMsgSpace({ ...input, model }),
    (model) => updateFromJoinSpaceButton({ ...input, model }),
  )
}

const updateFromJoinSpaceButton: SpaceFrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'join-space.clicked-person-list-item': {
      const isOpen = input.model.opened === 'join-space.person-preview-surface'
      if (isOpen) {
        return {
          model: { ...input.model, opened: null },
          msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
        }
      }
      return {
        model: { ...input.model, opened: 'join-space.person-preview-surface' },
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
      }
    }
    case 'join-space.submitted-join-space-form': {
      if (!input.ctx.currentUser?.userId) return { model: input.model }

      return {
        model: input.model,
        msgSpace: [
          withEventId<MsgSpace>({
            t: 'user-joined-space',
            spaceId: input.msg.spaceId,
            userId: input.ctx.currentUser.userId,
          }),
        ],
      }
    }
    case 'join-space.closed-person-item-surface': {
      if (input.model.opened === 'join-space.person-preview-surface') {
        return { model: { ...input.model, opened: null }, msgOut: [PlaySoundCmd.init(APP_SOUND.tap)] }
      }
      return { model: input.model }
    }

    case 'join-space.opened-person-details': {
      return {
        model: input.model,
        msgOut: [PushScreenCmd.init({ t: 'profile', n: 'profile', userId: input.msg.userId }, true)],
      }
    }
  }
  return { model: input.model }
}

const updateFromMsgSpace: SpaceFrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-joined-space': {
      const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

      if (!currentUserSpace) return { model: input.model }

      const currentUserSpaceId = Space.toSpaceId(currentUserSpace)

      if (input.msgSpace.spaceId !== currentUserSpaceId) return { model: input.model }

      if (input.msgSpace.userId !== input.ctx.currentUser?.userId) {
        const username = input.ctx.profilesByUserId[input.msgSpace.userId]?.username ?? null
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
  return { model: input.model }
}

const view: SpaceFrontendModule['View'] = (input) => {
  const currentUser = input.ctx.currentUser

  if (!currentUser) return Text({ text: 'No current user' })

  const space = input.ctx.space

  if (!space) return Text({ text: 'No space' })

  const spaceCtx: SpaceFrontendCtx = { ...input.ctx, space, currentUser }
  const hostProfile = input.ctx.profilesByUserId[space.hostId]

  return h(ScreenLayout, {
    dataTestId: 'spaces/join-space',
    id: 'join-space',
    parentScreen: input.ctx.parentScreen,
    ctx: input.ctx,
    postAction: {
      onSubmit: () => input.dispatch({ t: 'join-space.submitted-join-space-form', spaceId: space.spaceId }),
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
        onPress: () => input.dispatch({ t: 'exit-space-action.clicked-exit-space-button' }),
      },
    },
    renderBody: () =>
      h(Box, { class: 'flex flex-row w-full flex-col gap-6' }, [
        space.game && h(SectionGame, { ctx: input.ctx, gameName: space.game.t }),

        h(SectionPeopleList, {
          ctx: spaceCtx,
          onPressItem: (userId) => input.dispatch({ t: 'join-space.clicked-person-list-item', userId }),
          renderItem: (profile, vDom) =>
            h(SurfaceLayout, {
              ctx: spaceCtx,
              ariaLabel: input.ctx.t('?'),
              open: input.model.opened === 'join-space.person-preview-surface',
              onClose: () => input.dispatch({ t: 'join-space.closed-person-item-surface' }),
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
                      input.dispatch({ t: 'join-space.opened-person-details', userId: profile.userId }),
                    ctx: spaceCtx,
                    profile: profile,
                  }),
              },
            }),
        }),
      ]),
  })
}

const SectionGame = (props: {
  ctx: {
    t: Translator
    platform: IPlatform
  }
  gameName: GameName
}) => {
  return h(Box, { class: 'flex w-full flex-col gap-6 py-3' }, [
    h(SectionTitle, { text: props.ctx.t('spaces.game') }),

    h(Box, { class: 'flex flex-row w-fit items-center gap-4 px-6' }, [
      h(GameCoverArt, { rounded: true, class: 'size-20', gameName: props.gameName, platform: props.ctx.platform }),

      h(Typography, { variant: 'label', sizeClassName: 'text-lg', text: props.ctx.t(props.gameName) }),
    ]),
  ])
}

export const JoinSpaceFrontend = {
  view,
  update,
}
