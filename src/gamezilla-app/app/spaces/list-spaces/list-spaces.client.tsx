import { Ok, RequestResponse, startedRequest } from 'gamezilla-app/@/core'
import { APP_SOUND, playSound, pushRoute, sendToServer } from 'gamezilla-app/app/@/client'
import type { SpaceId } from 'gamezilla-app/app/@/data'
import { IconGamepad, Spinner, TopBar } from 'gamezilla-app/app/@/ui'
import { EmptyState } from 'gamezilla-app/app/@/ui/empty-state'
import type { SpaceClientModule } from '../@/architecture/space-client'
import type { SpaceCoreState } from '../spaces-core'
import * as Spaces from '../spaces-core/spaces-core-client/spaces-core.client'
import { StartSpaceClient } from '../start-space/start-space.client'
import { ViewSpaceCard } from './space-card'

//
//
//
//
//

const sendListSpacesRequest: SpaceClientModule['update'] = ({ model, ctx }) => {
  if (model.listSpacesRequest.t === 'loading') {
    return { model }
  }

  return {
    model: {
      ...model,
      listSpacesRequest: startedRequest(ctx.now)
    },
    msgCmd: [sendToServer({ t: 'list-spaces', limit: 100, offset: 0 })]
  }
}

//
//
//
//
//
//

const init: SpaceClientModule['init'] = ({ model, ctx }) => {
  return sendListSpacesRequest({ model, ctx })
}

//
//
//
//
//
//
//

const update: SpaceClientModule['update'] = (input) => {
  switch (input.msgEvt?.t) {
    case 'routing/route-changed': {
      if (input.msgEvt.route.t === 'space-list') {
        return sendListSpacesRequest(input)
      }
      return {
        model: input.model
      }
    }

    case 'wire/server-connected': {
      return sendListSpacesRequest(input)
    }
  }

  switch (input.msg?.t) {
    case 'time-passed': {
      return {
        model: {
          ...input.model,
          listSpacesRequest: RequestResponse.timePassed(input.model.listSpacesRequest, input.ctx.now)
        }
      }
    }

    case 'clicked-space-card': {
      return {
        model: input.model,
        msgCmd: [
          pushRoute({
            n: 'spaces',
            t: 'space',
            spaceId: input.msg.spaceId
          }),
          playSound(APP_SOUND.navForwardMin)
        ]
      }
    }
  }

  switch (input.msgServer?.t) {
    case 'listed-spaces': {
      const merged = Spaces.mergeMany({
        model: input.model,
        spaces: input.msgServer.spaces
      })
      return {
        model: {
          ...input.model,
          spaceIdByUserId: merged.spaceIdByUserId,
          spaces: merged.spaces,
          listSpacesRequest: RequestResponse.response(input.model.listSpacesRequest, input.ctx.now, Ok(null))
        }
      }
    }
  }

  return { model: input.model }
}

//
//
//
// View
//
//
//

const toSpaces = (model: Spaces.Model) => {
  const spaces: SpaceCoreState.Started[] = []
  for (const spaceId in model.spaces) {
    const started = Spaces.toSpaceStarted(model, spaceId as SpaceId)
    if (started) {
      spaces.push(started)
    }
  }
  return spaces
}

const View: SpaceClientModule['View'] = (input) => {
  if (!input.ctx.currentUserId) {
    return null
  }

  const currentUserSpaceId = input.model.spaceIdByUserId[input.ctx.currentUserId]

  const spaces = toSpaces(input.model)

  const showSpinner = input.model.listSpacesRequest.t === 'loading'

  return (
    <div className='relative flex w-full flex-1 flex-col overflow-hidden'>
      <TopBar onBack={false} ctx={input.ctx} center title={input.ctx.t('spaces.spaces')} />

      <div className='relative flex w-full flex-1 flex-col overflow-hidden overflow-y-scroll pb-8'>
        {!showSpinner && spaces.length === 0 && (
          <EmptyState renderIcon={(input) => <IconGamepad {...input} />} label={input.ctx.t('spaces.no-spaces')} />
        )}

        <div className='flex w-full flex-1 flex-col gap-5 p-5'>
          {spaces.flatMap((state) => (
            <ViewSpaceCard
              key={state.spaceId}
              ctx={{ ...input.ctx, currentUserId: input.ctx.currentUserId }}
              onClick={() => input.dispatch({ t: 'clicked-space-card', spaceId: state.spaceId })}
              state={state}
            />
          ))}
          {showSpinner && (
            <div className='flex w-full items-center justify-center p-4'>
              <Spinner />
            </div>
          )}
        </div>
      </div>

      {!currentUserSpaceId && (
        <div className='absolute bottom-6 right-4'>
          <StartSpaceClient.ViewStartSpaceButton {...input} />
        </div>
      )}
    </div>
  )
}

export const ListSpacesClient = {
  init,
  update,
  View
}
