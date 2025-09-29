import { EmptyState } from '~/@/ui/empty-state'
import { IconGamepad } from '~/@/ui/icon'
import { LoadingState } from '~/@/ui/spinner-block'
import { h } from '~/@/vdom/h'
import { ScrollBox } from '~/@/vdom/primitives/scroll-box'
import { sx } from '~/@/vdom/style/sx'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { ActionCreateProps } from '~/app/@/ui/screen/layout/screen-layout-props'
import type { SpaceFrontendModule } from '../frontend/space-frontend'
import { Space } from '../space/space'
import { SpaceDbQueryCache } from '../space/space-db-query-cache'
import { SpaceDbQuery } from '../space/space-db/interface-query'
import { FrontendCtxModule, ModelFrontend } from '../types'
import { ViewSpaceCard } from './space-card/space-card'
import { isMsgFrontend, MsgFrontend } from './types'

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

const update = <T extends ModelFrontend>(input: {
  ctx: FrontendCtxModule
  model: T
  msg?: unknown
  msgIn?: unknown
}): {
  model: T
  msgOut?: unknown[]
} => {
  if (!isMsgFrontend(input.msg)) return input

  switch (input.msg.t) {
    case 'listSpaces_clickedSpaceCard': {
      return {
        model: input.model,
        msgOut: [
          PushScreenCmd.init({ n: 'spaces', t: 'spaces_space', spaceId: input.msg.spaceId }),
          PlaySoundCmd.init(APP_SOUND.navForwardMin),
        ],
      }
    }
  }
}

const View = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  dispatch: (msg: MsgFrontend) => void
  slots: {
    actionCreate: ActionCreateProps | null
  }
}) => {
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
    actionCreate: input.slots.actionCreate,
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
                  onPress: () => input.dispatch({ t: 'listSpaces_clickedSpaceCard', spaceId: spaceProjection.spaceId }),
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
