import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import type { SpaceId } from '~/app/@/data/space-id'
import { ScreenTitleButton } from '~/app/@/ui/screen-title-button'
import { SpaceFrontendCtx } from '~/app/spaces/@/space-frontend/ctx'
import type { SpaceFrontendModule } from '../../@/architecture/space-frontend'
import { SpacesCoreFrontend } from '../../core/frontend'
import { EndSpaceFrontend } from '../../end-space/end-space.frontend'
import { GameFrontend } from '../../game/frontend'
import { JoinSpaceFrontend } from '../../join-space/frontend'
import { LeaveSpaceFrontend } from '../../leave-space/frontend'
import type { ModelFrontend, MsgFrontend } from '../../types'
import { Feed } from '../feed'
import { GoHome } from '../go-home'
import { People } from '../people'

const View = (input: {
  model: ModelFrontend
  ctx: AppFrontendCtx
  dispatch: (m: MsgFrontend) => void
  spaceId: SpaceId
}) => {
  const spaceState = SpacesCoreFrontend.toSpaceState(input.model, input.spaceId)

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
        currentUserId: input.ctx.currentUserId,
        space: spaceState,
      }

      const currentUserSpaceId = SpacesCoreFrontend.toSpaceIdByUserId(input.model, input.ctx.currentUserId)

      if (currentUserSpaceId !== spaceCtx.space.spaceId) {
        return (
          <>
            <JoinSpaceFrontend.View {...input} ctx={spaceCtx} />
            <People.View {...input} ctx={spaceCtx} />
          </>
        )
      }

      return (
        <div className='flex h-full w-full flex-1 flex-col'>
          <People.View {...input} ctx={spaceCtx} />

          <ViewTopBar {...input} ctx={spaceCtx} />

          {false && <Feed.View spaceState={spaceState} ctx={spaceCtx} model={input.model} dispatch={input.dispatch} />}

          <div className='flex w-full flex-1 flex-col overflow-hidden'>
            <GameFrontend.View {...input} ctx={spaceCtx} />
          </div>
        </div>
      )
    }
  }
}

const ViewTopBar: SpaceFrontendModule['View'] = (input) => {
  const isHost = input.ctx.space?.hostId === input.ctx.currentUserId
  return (
    <div className='flex h-12 w-full items-center gap-2 px-4'>
      <div className='-ml-2'>
        <GoHome.ViewIconButton {...input} />
      </div>
      <div className='-ml-2'>
        <People.ViewIconButton {...input} />
      </div>

      <div className='flex-1' />

      <div className='-mr-4 p-2'>
        {isHost ? (
          <EndSpaceFrontend.ViewEndSpaceButton {...input} />
        ) : (
          <LeaveSpaceFrontend.ViewLeaveSpaceButton {...input} />
        )}
      </div>
    </div>
  )
}

const ViewSpaceNotFound = (input: { ctx: AppFrontendCtx; dispatch: (m: MsgFrontend) => void }) => {
  return (
    <ScreenTitleButton
      title={input.ctx.t('spaces.space-not-found')}
      buttonText={input.ctx.t('spaces.go-home')}
      onClick={() =>
        input.dispatch({
          t: 'clicked-go-home-button',
        })
      }
    />
  )
}

export const SpaceFrontend = {
  View,
}
