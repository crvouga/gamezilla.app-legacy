import { Sub } from '~/@/sub'
import { EmptyState } from '~/@/ui/empty-state'
import { Gutter } from '~/@/ui/gutter'
import { IconGamepad } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import type { SpaceFrontendModule } from '../frontend/space-frontend'
import { CurrentUserSpaceLoader } from '../space/current-user-space-loader'
import { Space } from '../space/space'
import { StartSpaceFrontend } from '../start-space/frontend'
import { ViewSpaceCard } from './space-card/space-card'

export const TEST_ID_SPACE_LIST_SCREEN = 'spaces/space-list-screen'

const update: SpaceFrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'list-spaces.clicked-space-card': {
      return {
        model: input.model,
        msgOut: [
          PushScreenCmd.init({ n: 'spaces', t: 'space', spaceId: input.msg.spaceId }),
          PlaySoundCmd.init(APP_SOUND.navForwardMin),
        ],
      }
    }
  }

  return { model: input.model }
}

const View: SpaceFrontendModule['View'] = (input) => {
  if (!input.ctx.currentUser?.userId) return null

  const currentUserSpace = CurrentUserSpaceLoader.toCurrentUserSpace(input.ctx)

  const spaces = currentUserSpace ? [currentUserSpace] : []

  const spaceProjections = spaces.map((space) => Space.toSpaceProjection(space))

  return h(ScreenLayout, {
    dataTestId: TEST_ID_SPACE_LIST_SCREEN,
    parentScreen: input.ctx.parentScreen,
    id: 'list-spaces',
    ctx: input.ctx,
    navBar: {
      title: input.ctx.t('spaces.spaces'),
    },
    postAction: StartSpaceFrontend.viewStartSpaceButton(input),
    renderBody: () => {
      if (spaces.length === 0) {
        return h(EmptyState, {
          renderIcon: (input) => h(IconGamepad, input),
          label: input.ctx.t('spaces.no-spaces'),
        })
      }
      return h(
        'div',
        {
          class: 'flex flex-1 flex-col gap-4 overflow-y-auto p-6',
        },
        [
          ...spaceProjections.flatMap((spaceProjection) => {
            switch (spaceProjection.type) {
              case 'ended':
              case 'initial':
                return []
              case 'started': {
                return [
                  h(ViewSpaceCard, {
                    key: spaceProjection.spaceId,
                    ctx: { ...input.ctx, currentUser: input.ctx.currentUser },
                    onClick: () =>
                      input.dispatch({ t: 'list-spaces.clicked-space-card', spaceId: spaceProjection.spaceId }),
                    state: spaceProjection,
                  }),
                ]
              }
            }
          }),
          h(Gutter, { variant: 'screen' }),
        ],
      )
    },
  })
}

const subscriptions: SpaceFrontendModule['subscriptions'] = (_input) => {
  return Sub.none()
}

export const ListSpacesFrontend = {
  update,
  View,
  subscriptions,
}
