import type { SpaceId } from '~/app/@/data/space-id'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { ScreenTitleButton } from '~/app/@/ui/screen/title-button/screen-title-button'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { SpacesCore } from '../core/core'
import { EndSpaceFrontend } from '../end-space/frontend'
import { ExitSpaceAction } from '../frontend/exit-space-action/frontend'
import { PeopleActionFrontend } from '../frontend/people-action/frontend'
import { GameFrontend } from '../game/frontend'
import { JoinSpaceFrontend } from '../join-space/frontend'
import { LeaveSpaceFrontend } from '../leave-space/frontend'
import type { ModelFrontend, MsgFrontend } from '../types'

const View = (input: {
  model: ModelFrontend
  ctx: AppFrontendCtx
  dispatch: (m: MsgFrontend) => void
  spaceId: SpaceId
}) => {
  const spaceState = SpacesCore.toSpaceState(input.model.spaces, input.spaceId)

  switch (spaceState.type) {
    case 'initial': {
      return <ViewSpaceNotFound {...input} />
    }

    case 'ended': {
      return <EndSpaceFrontend.ViewSpaceEnded {...input} />
    }

    case 'started': {
      const spaceCtx: SpaceFrontendCtx = {
        ...input.ctx,
        currentUserId: input.ctx.currentUser.userId,
        space: spaceState,
      }

      const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(input.model.spaces, input.ctx.currentUser.userId)

      if (currentUserSpaceId !== spaceCtx.space.spaceId) {
        return <JoinSpaceFrontend.View {...input} ctx={spaceCtx} />
      }
      const inputNew = { ...input, ctx: spaceCtx }
      const isHost = inputNew.ctx.space.hostId === inputNew.ctx.currentUser.userId

      const spaceCtxFinal: SpaceFrontendCtx = {
        ...spaceCtx,
        parentScreen: {
          id: 'space-screen',
          parentScreen: null,
          actionBar: {
            id: 'space-actions',
            position: 'top',
            size: 'sm',
            variant: {
              t: 'space-between',
              start: [ExitSpaceAction.viewAction(inputNew), PeopleActionFrontend.view(inputNew)],
              end: [isHost ? EndSpaceFrontend.viewAction(inputNew) : LeaveSpaceFrontend.viewAction(inputNew)],
            },
          },
        },
      }

      const inputFinal = { ...inputNew, ctx: spaceCtxFinal }

      return <GameFrontend.View {...inputFinal} />
    }
  }
}

const ViewSpaceNotFound = (input: { ctx: AppFrontendCtx; dispatch: (m: MsgFrontend) => void }) => {
  return (
    <ScreenTitleButton
      title={input.ctx.t('spaces.space-not-found')}
      buttonText={input.ctx.t('spaces.exit-space')}
      onClick={() => input.dispatch({ t: 'exit-space-action.clicked-exit-space-button' })}
    />
  )
}

export const SpaceFrontend = {
  View,
}
