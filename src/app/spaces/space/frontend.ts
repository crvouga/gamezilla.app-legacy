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
import { Spaces } from './spaces'

export const TEST_ID_SPACE_SCREEN = 'spaces/space-screen'

const View = (input: {
  model: ModelFrontend
  ctx: FrontendCtxModule
  dispatch: (m: MsgFrontend) => void
  spaceId: SpaceId
}) => {
  const spaceState = Spaces.toSpaceProjection(input.model.spaces, input.spaceId)

  switch (spaceState.type) {
    case 'initial': {
      return h(ViewSpaceNotFound, input)
    }

    case 'ended': {
      return h(EndSpaceFrontend.ViewSpaceEnded, input)
    }

    case 'started': {
      const currentUser = input.ctx.currentUser

      if (!currentUser) return null

      const spaceCtx: SpaceFrontendCtx & FrontendCtxModule = { ...input.ctx, currentUser, space: spaceState }

      const currentUserSpaceId = Spaces.toSpaceIdByUserId(input.model.spaces, currentUser.userId)

      const isNotJoined = currentUserSpaceId !== spaceCtx.space.spaceId

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

const ViewSpaceNotFound = (input: { ctx: FrontendCtxModule; dispatch: (m: MsgFrontend) => void }) => {
  return h(ScreenTitleButton, {
    title: input.ctx.t('spaces.space-not-found'),
    buttonText: input.ctx.t('spaces.exit-space'),
    onClick: () => input.dispatch({ t: 'exit-space-action.clicked-exit-space-button' }),
  })
}

export const SpaceFrontend = {
  View,
}
