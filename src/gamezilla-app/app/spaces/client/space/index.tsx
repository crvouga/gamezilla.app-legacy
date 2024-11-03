import type { AppClientCtx } from 'gamezilla-app/app/@/client'
import type { SpaceId } from 'gamezilla-app/app/@/data'
import { Button, IconButton, IconHome, IconUserGroup, Typography } from 'gamezilla-app/app/@/ui'
import type { SpaceClientModule } from '../../@/architecture/space-client'
import { SpaceClientCtx } from '../../@/space-client-ctx'
import * as SpacesCoreClient from '../../core/client/spaces-core.client'
import { EndSpaceClient } from '../../end-space/end-space.client'
import { GameClient } from '../../game/client'
import { JoinSpaceClient } from '../../join-space/client'
import { LeaveSpaceClient } from '../../leave-space/client'
import type { ModelClient, MsgClient } from '../../types'
import { Feed } from '../feed'
import { Modals } from '../modals'

const View = (input: { model: ModelClient; ctx: AppClientCtx; dispatch: (m: MsgClient) => void; spaceId: SpaceId }) => {
  const spaceState = SpacesCoreClient.toSpaceState(input.model, input.spaceId)

  switch (spaceState.type) {
    case 'initial': {
      return <ViewSpaceNotFound {...input} />
    }

    case 'ended': {
      return <EndSpaceClient.ViewSpaceEnded {...input} />
    }

    case 'started': {
      const spaceCtx: SpaceClientCtx = {
        ...input.ctx,
        currentUserId: input.ctx.currentUserId,
        space: spaceState
      }

      const currentUserSpaceId = SpacesCoreClient.toSpaceIdByUserId(input.model, input.ctx.currentUserId)

      if (currentUserSpaceId !== spaceCtx.space.spaceId) {
        return (
          <>
            <JoinSpaceClient.View {...input} ctx={spaceCtx} />
            <Modals.View {...input} ctx={spaceCtx} />
          </>
        )
      }

      return (
        <div className='flex h-full w-full flex-1 flex-col'>
          <Modals.View {...input} ctx={spaceCtx} />

          <ViewTopBar {...input} ctx={spaceCtx} />

          {false && <Feed.View spaceState={spaceState} ctx={spaceCtx} model={input.model} dispatch={input.dispatch} />}

          <div className='flex w-full flex-1 flex-col overflow-hidden'>
            <GameClient.View {...input} ctx={spaceCtx} />
          </div>
        </div>
      )
    }
  }
}

const ViewTopBar: SpaceClientModule['View'] = (input) => {
  if (!input.ctx.space || !input.ctx.currentUserId) {
    return null
  }

  const peopleCount = Object.keys(input.ctx.space.users).length

  return (
    <div className='flex h-12 w-full items-center gap-2 border-b  px-4'>
      <IconButton
        onClick={() =>
          input.dispatch({
            t: 'clicked-go-home-button'
          })
        }
        label={input.ctx.t('spaces.home')}
        className='-ml-2'
        renderIcon={(inputIcon) => <IconHome {...inputIcon} />}
      />

      <IconButton
        onClick={() =>
          input.dispatch({
            t: 'clicked-people-button'
          })
        }
        label={input.ctx.t('spaces.people-count', peopleCount)}
        renderIcon={(inputIcon) => <IconUserGroup {...inputIcon} />}
      />

      <div className='flex-1' />

      <div className='-mr-2 p-2'>
        {input.ctx.space.hostId !== input.ctx.currentUserId && <LeaveSpaceClient.ViewLeaveSpaceButton {...input} />}

        {input.ctx.space.hostId === input.ctx.currentUserId && <EndSpaceClient.ViewEndSpaceButton {...input} />}
      </div>
    </div>
  )
}

const ViewSpaceNotFound = (input: { ctx: AppClientCtx; dispatch: (m: MsgClient) => void }) => {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-4'>
      <Typography variant='title' text={input.ctx.t('spaces.space-not-found')} />
      <Button
        onClick={() =>
          input.dispatch({
            t: 'clicked-go-home-button'
          })
        }
        size='lg'
        variant='contained'
        color='primary'
        text={input.ctx.t('spaces.go-home')}
      />
    </div>
  )
}

export const SpaceClient = {
  View
}
