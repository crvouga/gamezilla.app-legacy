import { IDb } from '~/@/db/interface'
import { Sub } from '~/@/sub'
import { LoadingState } from '~/@/ui/spinner-block'
import { h } from '~/@/vdom/h'
import type { SpaceId } from '~/app/@/data/space-id'
import { ScreenTitleButton } from '~/app/@/ui/screen/title-button/screen-title-button'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { EndSpaceFrontend } from '../end-space'
import { ExitSpaceAction } from '../frontend/exit-space-action/frontend'
import { PeopleActionFrontend } from '../frontend/people-action/frontend'
import { GameFrontend } from '../game/frontend'
import { JoinSpaceFrontend } from '../join-space'
import { LeaveSpaceFrontend } from '../leave-space/frontend'
import type { FrontendCtxModule, ModelFrontend, MsgFrontend } from '../types'
import { Space } from './space'
import { SpaceDbQueryCache } from './space-db-query-cache'
import { ISpaceDb } from './space-db/interface'

export const TEST_ID_SPACE_SCREEN = 'spaces/space-screen'

const toQuery = (spaceId: SpaceId): IDb.InferQueryInput<typeof ISpaceDb.schema> => {
  return { where: { op: '=', column: 'id', value: spaceId } }
}

const View = (props: {
  model: ModelFrontend
  ctx: FrontendCtxModule
  dispatch: (m: MsgFrontend) => void
  spaceId: SpaceId
}) => {
  const space = SpaceDbQueryCache.entity(props.ctx, props.spaceId)
  const spaceProjection = Space.toSpaceProjection(space)
  switch (spaceProjection.type) {
    case 'initial': {
      const query = toQuery(props.spaceId)

      const isLoading = SpaceDbQueryCache.isLoading(props.ctx, query)

      if (isLoading) return h(ViewSpaceLoading, props)

      return h(ViewSpaceNotFound, props)
    }

    case 'ended': {
      return h(EndSpaceFrontend.ViewSpaceEnded, {
        ctx: props.ctx,
        dispatch: (c) => props.dispatch({ t: 'endSpace', c }),
        model: props.model,
      })
    }

    case 'started': {
      const currentUser = props.ctx.currentUser

      if (!currentUser) return null

      const spaceCtx: SpaceFrontendCtx & FrontendCtxModule = { ...props.ctx, currentUser, space: spaceProjection }

      const isJoined = currentUser.userId in spaceProjection.users

      if (!isJoined) {
        return h(JoinSpaceFrontend.View, {
          ctx: spaceCtx,
          dispatch: (c) => props.dispatch({ t: 'joinSpace', c }),
          model: props.model,
        })
      }

      const inputNew = { ...props, ctx: spaceCtx }

      const isHost = inputNew.ctx.space.hostId === inputNew.ctx.currentUser.userId

      const spaceCtxFinal: FrontendCtxModule & SpaceFrontendCtx = {
        ...spaceCtx,
        topic: props.ctx.topic,
        rpc: props.ctx.rpc,
        parentScreen: {
          dataTestId: TEST_ID_SPACE_SCREEN,
          id: 'space-screen',
          parentScreen: null,
          actionBar: {
            id: 'space-actions',
            position: 'top',
            size: 'sm',
            variant: {
              t: 'space-between',
              start: [
                ExitSpaceAction.viewAction({
                  ctx: props.ctx,
                  dispatch: (c) => props.dispatch({ t: 'exitSpaceAction', c }),
                }),
                PeopleActionFrontend.view({
                  ctx: props.ctx,
                  model: props.model,
                  dispatch: (c) => props.dispatch({ t: 'peopleAction', c }),
                }),
              ],
              end: [
                isHost
                  ? EndSpaceFrontend.viewAction({
                      ctx: props.ctx,
                      dispatch: (c) => props.dispatch({ t: 'endSpace', c }),
                    })
                  : LeaveSpaceFrontend.viewAction({
                      ctx: props.ctx,
                      dispatch: (c) => props.dispatch({ t: 'leaveSpace', c }),
                    }),
              ],
            },
          },
        },
      }

      return h(GameFrontend.View, { ...inputNew, ctx: spaceCtxFinal })
    }
  }
}

const ViewSpaceLoading = (_input: { ctx: FrontendCtxModule; dispatch: (m: MsgFrontend) => void }) => {
  return h(LoadingState, {})
}

const ViewSpaceNotFound = (input: { ctx: FrontendCtxModule; dispatch: (m: MsgFrontend) => void }) => {
  return h(ScreenTitleButton, {
    title: input.ctx.t('spaces.space-not-found'),
    buttonText: input.ctx.t('spaces.exit-space'),
    onPress: () => input.dispatch({ t: 'exitSpaceAction', c: { t: 'exitSpaceAction_clicked' } }),
  })
}

const subscriptions = (input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<MsgFrontend> => {
  const spaceId = input.ctx.currentScreen.t === 'spaces_space' ? input.ctx.currentScreen.spaceId : null
  if (!spaceId) return Sub.none()
  return SpaceDbQueryCache.sub(input.ctx.spaceDb, toQuery(spaceId), (c): MsgFrontend => ({ t: 'gotQueryCacheMsg', c }))
}

export const SpaceFrontend = {
  View,
  subscriptions,
}
