import { EmptyState } from '~/@/ui/empty-state'
import { IconGamepad } from '~/@/ui/icon'
import { LoadingState } from '~/@/ui/spinner-block'
import { sx } from '~/@/vdom/style/sx'
import { h } from '~/@/vdom/h'
import { ScrollBox } from '~/@/vdom/primitives/scroll-box'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import type { SpaceFrontendModule } from '../frontend/space-frontend'
import { Space } from '../space/space'
import { SpaceDbQueryCache } from '../space/space-db-query-cache'
import { SpaceDbQuery } from '../space/space-db/interface-query'
import { StartSpaceFrontend } from '../start-space/frontend'
import { ViewSpaceCard } from './space-card/space-card'

export const TEST_ID_SPACE_LIST_SCREEN = 'spaces/space-list-screen'

const toQuery = (): SpaceDbQuery => {
  return {
    where: {
      type: {
        '=': 'started',
      },
    },
  }
}

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
  const query = toQuery()
  const spaces = SpaceDbQueryCache.read(input.ctx, query)
  const isLoading = SpaceDbQueryCache.isLoading(input.ctx, query)
  const spaceProjections = spaces.map(Space.toSpaceProjection)

  return h(ScreenLayout, {
    dataTestId: TEST_ID_SPACE_LIST_SCREEN,
    parentScreen: input.ctx.parentScreen,
    id: 'list-spaces',
    ctx: input.ctx,
    navBar: {
      title: input.ctx.t('spaces.spaces'),
    },
    actionCreate: StartSpaceFrontend.viewStartSpaceButton(input),
    renderBody: () => {
      if (isLoading) return h(LoadingState, {})

      if (spaces.length === 0)
        return h(EmptyState, {
          renderIcon: (input) => h(IconGamepad, input),
          label: input.ctx.t('spaces.no-spaces'),
        })

      return h(
        ScrollBox,
        {
          style: sx({
            flex: 1,
            flexDirection: 'col',
            padding: 6,
          }),
          contentContainerStyle: {
            rowGap: 16,
          },
        },
        spaceProjections.flatMap((spaceProjection) => {
          switch (spaceProjection.type) {
            case 'ended':
            case 'initial':
              return []
            case 'started': {
              return [
                h(ViewSpaceCard, {
                  key: spaceProjection.spaceId,
                  ctx: { ...input.ctx, currentUser: input.ctx.currentUser },
                  onPress: () =>
                    input.dispatch({ t: 'list-spaces.clicked-space-card', spaceId: spaceProjection.spaceId }),
                  state: spaceProjection,
                }),
              ]
            }
          }
        }),
      )
    },
  })
}

const subscriptions: SpaceFrontendModule['subscriptions'] = (input) => {
  return SpaceDbQueryCache.sub(input.ctx.spaceDb, toQuery(), (c) => ({ t: 'got-msg-out', c }))
}

export const ListSpacesFrontend = {
  update,
  View,
  subscriptions,
}
