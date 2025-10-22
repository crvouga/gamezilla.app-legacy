import { IDb } from '~/@/db/interface'
import { Sub } from '~/@/sub'
import { EmptyState } from '~/@/ui/empty-state'
import { IconGamepad } from '~/@/ui/icon'
import { LoadingState } from '~/@/ui/spinner-block'
import { h } from '~/@/vdom/h'
import { ScrollBox } from '~/@/vdom/primitives/scroll-box'
import { sx } from '~/@/vdom/style/sx'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { pushScreen } from '~/app/@/frontend/push-screen-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { ActionCreateProps } from '~/app/@/ui/screen/layout/screen-layout-props'
import { Space } from '../space/space'
import { SpaceDbQueryCache } from '../space/space-db-query-cache'
import { ISpaceDb } from '../space/space-db/interface'
import { FrontendCtxModule, ModelFrontend } from '../types'
import { ViewSpaceCard } from './space-card/space-card'

import { Eff } from '~/@/eff'
import { SpaceId } from '~/app/@/data/space-id'
import { playSound } from '~/app/@/frontend/sound-cmd'
import { GotQueryCacheMsg } from '~/app/frontend/query-cache/got-query-cache-msg.$msg'

export const TEST_ID_SPACE_LIST_SCREEN = 'spaces/space-list-screen'

export type Msg =
  | { t: 'listSpaces_clickedSpaceCard'; spaceId: SpaceId }
  | { t: 'listSpaces_gotMsgSpace'; c: GotQueryCacheMsg }

const toQuery = (): IDb.InferQueryInput<typeof ISpaceDb.schema> => {
  return {
    where: {
      op: '=',
      column: 'type',
      value: 'started',
    },
  }
}

const update = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  msg: Msg
}): {
  model: ModelFrontend
  eff?: Eff<Msg>
} => {
  switch (input.msg.t) {
    case 'listSpaces_gotMsgSpace': {
      return {
        model: input.model,
      }
    }
    case 'listSpaces_clickedSpaceCard': {
      return {
        model: input.model,
        eff: Eff.batch([
          pushScreen({ n: 'spaces', t: 'spaces_space', spaceId: input.msg.spaceId }),
          playSound(APP_SOUND.navForwardMin),
        ]),
      }
    }
  }
}

const subscriptions = (input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<Msg> => {
  return SpaceDbQueryCache.sub(
    input.ctx.spaceDb,
    toQuery(),
    (c): Msg => ({ t: 'listSpaces_gotMsgSpace', c: c as GotQueryCacheMsg }),
  )
}

const View = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  dispatch: (msg: Msg) => void
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

export const ListSpacesFrontend = {
  update,
  View,
  subscriptions,
}
