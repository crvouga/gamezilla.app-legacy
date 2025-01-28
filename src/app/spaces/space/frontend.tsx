import type { SpaceId } from '~/app/@/data/space-id'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { ScreenLayout } from '~/app/@/ui/screen-layout'
import { ScreenTitleButton } from '~/app/@/ui/screen-title-button'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { SpacesCore } from '../core/core'
import { EndSpaceFrontend } from '../end-space/frontend'
import { GameFrontend } from '../game/frontend'
import { JoinSpaceFrontend } from '../join-space/frontend'
import { LeaveSpaceFrontend } from '../leave-space/frontend'
import type { ModelFrontend, MsgFrontend } from '../types'
import { GoHome } from '../frontend/go-home'
import { People } from '../frontend/people'
// import { NavBarLogo } from '~/app/@/ui/logo'

const View = (input: {
  model: ModelFrontend
  ctx: AppFrontendCtx
  dispatch: (m: MsgFrontend) => void
  spaceId: SpaceId
}) => {
  const spaceState = SpacesCore.toSpaceState(input.model, input.spaceId)

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

      const currentUserSpaceId = SpacesCore.toSpaceIdByUserId(input.model, input.ctx.currentUserId)

      if (currentUserSpaceId !== spaceCtx.space.spaceId) {
        return (
          <>
            <JoinSpaceFrontend.View {...input} ctx={spaceCtx} />
            <People.View {...input} ctx={spaceCtx} />
          </>
        )
      }
      const inputNew = { ...input, ctx: spaceCtx }
      const isHost = inputNew.ctx.space.hostId === inputNew.ctx.currentUserId

      return (
        <ScreenLayout
          isTopLevel
          id='space'
          ctx={spaceCtx}
          actionPosition='top'
          actions={{
            // renderNavBar: () => <NavBarLogo onClick={() => inputNew.dispatch({ t: 'clicked-go-home-button' })} />,
            id: 'space-actions',
            buttons: [
              GoHome.viewAction(inputNew),
              People.viewAction(inputNew),
              isHost ? EndSpaceFrontend.viewAction(inputNew) : LeaveSpaceFrontend.viewAction(inputNew),
            ],
            size: 'sm',
            open: false,
            onToggle: () => {},
          }}
          renderBody={() => (
            <>
              <People.View {...inputNew} />
              <GameFrontend.View {...inputNew} />
            </>
          )}
        />
      )
    }
  }
}

const ViewSpaceNotFound = (input: { ctx: AppFrontendCtx; dispatch: (m: MsgFrontend) => void }) => {
  return (
    <ScreenTitleButton
      title={input.ctx.t('spaces.space-not-found')}
      buttonText={input.ctx.t('spaces.go-home')}
      onClick={() => input.dispatch({ t: 'clicked-go-home-button' })}
    />
  )
}

export const SpaceFrontend = {
  View,
}
