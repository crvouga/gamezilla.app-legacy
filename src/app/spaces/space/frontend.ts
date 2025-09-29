import { Sub } from '~/@/sub'
import { LoadingState } from '~/@/ui/spinner-block'
import { h } from '~/@/vdom/h'
import type { SpaceId } from '~/app/@/data/space-id'
import { ScreenTitleButton } from '~/app/@/ui/screen/title-button/screen-title-button'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { EndSpaceFrontend } from '../end-space/frontend'
import { ExitSpaceAction } from '../frontend/exit-space-action/frontend'
import { PeopleActionFrontend } from '../frontend/people-action/frontend'
import { GameFrontend } from '../game/frontend'
import { JoinSpaceFrontend } from '../join-space/frontend'
import { LeaveSpaceFrontend } from '../leave-space/frontend'
import type { FrontendCtxModule, ModelFrontend, MsgFrontend } from '../types'
import { Space } from './space'
import { SpaceDbQueryCache } from './space-db-query-cache'
import { SpaceDbQuery } from './space-db/interface-query'

export const TEST_ID_SPACE_SCREEN = 'spaces/space-screen'

const toQuery = (spaceId: SpaceId): SpaceDbQuery => {
  return { where: { spaceId: { '=': spaceId } } }
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
      return h(EndSpaceFrontend.ViewSpaceEnded, props)
    }

    case 'started': {
      const currentUser = props.ctx.currentUser

      if (!currentUser) return null

      const spaceCtx: SpaceFrontendCtx & FrontendCtxModule = { ...props.ctx, currentUser, space: spaceProjection }

      const isJoined = currentUser.userId in spaceProjection.users

      if (!isJoined) {
        return h(JoinSpaceFrontend.view, { ...props, ctx: spaceCtx })
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
              start: [ExitSpaceAction.viewAction(props), PeopleActionFrontend.view(props)],
              end: [isHost ? EndSpaceFrontend.viewAction(props) : LeaveSpaceFrontend.viewAction(props)],
            },
          },
        },
      }

      const inputFinal = {
        ...inputNew,
        ctx: spaceCtxFinal,
      }

      return h(GameFrontend.View, inputFinal)
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
    onPress: () => input.dispatch({ t: 'exitSpaceAction_clicked' }),
  })
}

const subscriptions = (input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<MsgFrontend> => {
  const spaceId = input.ctx.currentScreen.t === 'spaces_space' ? input.ctx.currentScreen.spaceId : null
  if (!spaceId) return Sub.none()
  return SpaceDbQueryCache.sub(input.ctx.spaceDb, toQuery(spaceId), (c): MsgFrontend => ({ t: 'spaces_gotMsgOut', c }))
}

export const SpaceFrontend = {
  View,
  subscriptions,
}
