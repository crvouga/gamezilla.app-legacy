import { unwrapOr } from '~/@/result'
import { Sub } from '~/@/sub'
import { EmptyState } from '~/@/ui/empty-state'
import { Gutter } from '~/@/ui/gutter'
import { IconGamepad } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ScreenChangedEvt } from '~/app/@/frontend/screen-changed-evt.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import type { SpaceFrontendModule } from '../frontend/space-frontend'
import { Spaces } from '../space/spaces'
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
    case 'list-spaces.list-spaces-response': {
      const spacesNew = unwrapOr(input.msg.spaces, { spaces: [] }).spaces
      return {
        model: {
          ...input.model,
          listSpacesRequest: input.msg.spaces,
          spaces: Spaces.merge(input.model.spaces, spacesNew),
        },
      }
    }
  }

  if (ScreenChangedEvt.is(input.msgIn)) {
    return {
      model: input.model,
      async eff(_dispatch) {
        // const spaces = await input.ctx.rpc['spaces.list-spaces.list']({ pagination: { limit: 100, offset: 0 } })
        // dispatch({ t: 'list-spaces.list-spaces-response', spaces })
      },
    }
  }

  return { model: input.model }
}

const View: SpaceFrontendModule['View'] = (input) => {
  if (!input.ctx.currentUser?.userId) return null

  const spaces = Spaces.toSpaceProjections(input.model.spaces)

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
          ...spaces.map((state) =>
            h(ViewSpaceCard, {
              key: state.spaceId,
              ctx: { ...input.ctx, currentUser: input.ctx.currentUser },
              onClick: () => input.dispatch({ t: 'list-spaces.clicked-space-card', spaceId: state.spaceId }),
              state: state,
            }),
          ),
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
