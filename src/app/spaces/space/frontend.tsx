import type { SpaceId } from '~/app/@/data/space-id'
import { ScreenTitleButton } from '~/app/@/ui/screen/title-button/screen-title-button'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { SpacesCore } from '../core/core'
import { EndSpaceFrontend } from '../end-space/frontend'
import { ExitSpaceAction } from '../frontend/exit-space-action/frontend'
import { PeopleActionFrontend } from '../frontend/people-action/frontend'
import { GameFrontend } from '../game/frontend'
import { JoinSpaceFrontend } from '../join-space/frontend'
import { LeaveSpaceFrontend } from '../leave-space/frontend'
import type { ModelFrontend, MsgFrontend, SpaceFrontendCtxModule } from '../types'

const View = (input: {
  model: ModelFrontend
  ctx: SpaceFrontendCtxModule
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
      const currentUser = input.ctx.currentUser

      if (!currentUser) return null

      const spaceCtx: SpaceFrontendCtx & SpaceFrontendCtxModule = {
        ...input.ctx,
        currentUserId: currentUser.userId,
        currentUserRole: currentUser.role,
        currentUser: currentUser,
        space: spaceState,
      }

      const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(input.model.spaces, currentUser.userId)

      const isNotJoined = currentUserSpaceId !== spaceCtx.space.spaceId

      if (isNotJoined) {
        return <JoinSpaceFrontend.View {...input} ctx={spaceCtx} />
      }

      const inputNew = { ...input, ctx: spaceCtx }

      const isHost = inputNew.ctx.space.hostId === inputNew.ctx.currentUser.userId

      const spaceCtxFinal: SpaceFrontendCtxModule & SpaceFrontendCtx = {
        ...spaceCtx,
        topic: input.ctx.topic,
        rpc: input.ctx.rpc,
        parentScreen: {
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

      return <GameFrontend.View {...inputFinal} />
    }
  }
}

const ViewSpaceNotFound = (input: { ctx: SpaceFrontendCtxModule; dispatch: (m: MsgFrontend) => void }) => {
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
