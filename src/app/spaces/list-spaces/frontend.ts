import { QueryInput } from '~/@/db/interface/query-input/query-input'
import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { EmptyState } from '~/@/ui/empty-state'
import { IconGamepad } from '~/@/ui/icon'
import { LoadingState } from '~/@/ui/spinner-block'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { ScrollBox } from '~/@/vdom/primitives/scroll-box'
import { sx } from '~/@/vdom/style/sx'
import { SpaceId } from '~/app/@/data/space-id'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { ActionCreateProps } from '~/app/@/ui/screen/layout/screen-layout-props'
import { pushScreen } from '~/app/frontend/current-screen/current-screen-cmd'
import { GotQueryCacheMsg } from '~/app/frontend/query-cache/got-query-cache-msg.$msg'
import { queryCacheMsgs } from '~/app/frontend/query-cache/query-cache-msgs'
import { Space } from '../space/space'
import { SpaceDbQueryCache, SpaceProjectionDbQueryCache } from '../space/space-db'
import { SpaceProjectionEntity } from '../space/space-db/space-projection-entity'
import { FrontendCtxModule, ModelFrontend } from '../types'
import { ViewSpaceCard } from './space-card/space-card'

export const TEST_ID_SPACE_LIST_SCREEN = 'spaces/space-list-screen'

export type Msg = { t: 'clickedSpaceCard'; spaceId: SpaceId } | { t: 'listSpaces_gotMsgSpace'; c: GotQueryCacheMsg }

const toProjectionQuery = (): QueryInput<SpaceProjectionEntity> => {
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
      const msg = input.msg
      return {
        model: input.model,
        eff: () => {
          queryCacheMsgs.pub(msg.c.c)
        },
      }
    }
    case 'clickedSpaceCard': {
      return {
        model: input.model,
        eff: pushScreen({ n: 'spaces', t: 'spaces_space', spaceId: input.msg.spaceId }, true),
      }
    }
  }
}

const subscriptions = (input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<Msg> => {
  const projectionQuery = toProjectionQuery()
  return SpaceProjectionDbQueryCache.watch(
    input.ctx.spaceProjectionDb,
    projectionQuery,
    (c): Msg => ({ t: 'listSpaces_gotMsgSpace', c: GotQueryCacheMsg.init(c) }),
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
  const projectionQuery = toProjectionQuery()
  const projections = SpaceProjectionDbQueryCache.query(input.ctx, projectionQuery)
  const isLoading = SpaceProjectionDbQueryCache.isLoading(input.ctx, projectionQuery)

  // Get the actual Space entities for the started spaces
  const spaceIds = projections.map((p) => p.id)
  const spaces = spaceIds
    .map((spaceId) => SpaceDbQueryCache.entity(input.ctx, spaceId))
    .filter((space): space is Space => space !== null)

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
      if (isLoading)
        return h(
          Box,
          {
            style: sx({
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }),
          },
          [h(LoadingState, {})],
        )

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
                  onPress: () => input.dispatch({ t: 'clickedSpaceCard', spaceId: spaceProjection.spaceId }),
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
