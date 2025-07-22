import { Sub } from '~/@/sub'
import { SpinnerBlock } from '~/@/ui/spinner-block'
import { h } from '~/@/vdom/h'
import type { SpaceId } from '~/app/@/data/space-id'
import { ScreenTitleButton } from '~/app/@/ui/screen/title-button/screen-title-button'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { EndSpaceFrontend } from '../end-space/frontend'
import { ExitSpaceAction } from '../frontend/exit-space-action/frontend'
import { PeopleActionFrontend } from '../frontend/people-action/frontend'
import { SpaceFrontendModule } from '../frontend/space-frontend'
import { GameFrontend } from '../game/frontend'
import { JoinSpaceFrontend } from '../join-space/frontend'
import { LeaveSpaceFrontend } from '../leave-space/frontend'
import type { FrontendCtxModule, ModelFrontend, MsgFrontend } from '../types'
import { CurrentUserSpaceLoader } from './current-user-space-loader'
import { Space } from './space'
import { SpaceDbQueryCache } from './space-db-query-cache'
import { SpaceDbQuery } from './space-db/interface-query'
import { SpaceProjection } from './space-projection'

export const TEST_ID_SPACE_SCREEN = 'spaces/space-screen'

const toQuery = (spaceId: SpaceId): SpaceDbQuery => {
  return { where: { spaceId: { '=': spaceId } } }
}

const View = (input: {
  model: ModelFrontend
  ctx: FrontendCtxModule
  dispatch: (m: MsgFrontend) => void
  spaceId: SpaceId
}) => {
  const query = toQuery(input.spaceId)

  const isLoading = SpaceDbQueryCache.isLoading(input.ctx, query)

  if (isLoading) return h(ViewSpaceLoading, input)

  const space = SpaceDbQueryCache.entity(input.ctx, input.spaceId)

  const spaceProjection = space ? Space.toSpaceProjection(space) : SpaceProjection.init

  switch (spaceProjection.type) {
    case 'initial': {
      return h(ViewSpaceNotFound, input)
    }

    case 'ended': {
      return h(EndSpaceFrontend.ViewSpaceEnded, input)
    }

    case 'started': {
      const currentUser = input.ctx.currentUser

      if (!currentUser) return null

      const spaceCtx: SpaceFrontendCtx & FrontendCtxModule = { ...input.ctx, currentUser, space: spaceProjection }

      const currentUserSpaceId = CurrentUserSpaceLoader.toCurrentUserSpaceId(input.ctx)

      const isNotJoined = spaceProjection.spaceId !== currentUserSpaceId

      if (isNotJoined) {
        return h(JoinSpaceFrontend.view, { ...input, ctx: spaceCtx })
      }

      const inputNew = { ...input, ctx: spaceCtx }

      const isHost = inputNew.ctx.space.hostId === inputNew.ctx.currentUser.userId

      const spaceCtxFinal: FrontendCtxModule & SpaceFrontendCtx = {
        ...spaceCtx,
        topic: input.ctx.topic,
        rpc: input.ctx.rpc,
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
              start: [ExitSpaceAction.viewAction(input), PeopleActionFrontend.view(input)],
              end: [isHost ? EndSpaceFrontend.viewAction(input) : LeaveSpaceFrontend.viewAction(input)],
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
  return h(SpinnerBlock, {})
}

const ViewSpaceNotFound = (input: { ctx: FrontendCtxModule; dispatch: (m: MsgFrontend) => void }) => {
  return h(ScreenTitleButton, {
    title: input.ctx.t('spaces.space-not-found'),
    buttonText: input.ctx.t('spaces.exit-space'),
    onClick: () => input.dispatch({ t: 'exit-space-action.clicked-exit-space-button' }),
  })
}

const subscriptions: SpaceFrontendModule['subscriptions'] = (input) => {
  const spaceId = input.ctx.currentScreen.t === 'space' ? input.ctx.currentScreen.spaceId : null
  if (!spaceId) return Sub.none()
  return SpaceDbQueryCache.sub(input.ctx.spaceDb, toQuery(spaceId), (c): MsgFrontend => ({ t: 'got-msg-out', c }))
}

export const SpaceFrontend = {
  View,
  subscriptions,
}
