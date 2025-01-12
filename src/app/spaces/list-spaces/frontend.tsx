import { RequestResponse, startedRequest } from '~/@/request-response/request-response'
import { Ok } from '~/@/result'
import { APP_SOUND, playSound, pushRoute, sendToBackend } from '~/app/@/frontend/cmd'
import type { SpaceId } from '~/app/@/data/space-id'
import { IconGamepad, Spinner, TopBar } from '~/app/@/ui'
import { EmptyState } from '~/app/@/ui/empty-state'
import type { SpaceFrontendModule } from '../@/architecture/space-frontend'
import { SpacesCoreFrontend } from '../core/frontend'
import { SpaceCoreState } from '../core/space-state'
import { StartSpaceFrontend } from '../start-space/frontend'
import { ViewSpaceCard } from './space-card'

//
//
//
//
//

const sendListSpacesRequest: SpaceFrontendModule['update'] = ({ model, ctx }) => {
  if (model.listSpacesRequest.t === 'loading') {
    return { model }
  }

  return {
    model: {
      ...model,
      listSpacesRequest: startedRequest(ctx.now),
    },
    msgCmd: [sendToBackend({ t: 'list-spaces', limit: 100, offset: 0 })],
  }
}

//
//
//
//
//
//

const init: SpaceFrontendModule['init'] = ({ model, ctx }) => {
  return sendListSpacesRequest({ model, ctx })
}

//
//
//
//
//
//
//

const update: SpaceFrontendModule['update'] = (input) => {
  switch (input.msgEvt?.t) {
    case 'routing-evt.route-changed': {
      if (input.msgEvt.route.t === 'space-list') {
        return sendListSpacesRequest(input)
      }
      return {
        model: input.model,
      }
    }

    case 'wire-evt.backend-connected': {
      return sendListSpacesRequest(input)
    }
  }

  switch (input.msg?.t) {
    case 'time-passed': {
      return {
        model: {
          ...input.model,
          listSpacesRequest: RequestResponse.timePassed(input.model.listSpacesRequest, input.ctx.now),
        },
      }
    }

    case 'clicked-space-card': {
      return {
        model: input.model,
        msgCmd: [
          pushRoute({ n: 'spaces', t: 'space', spaceId: input.msg.spaceId }),
          playSound(APP_SOUND.navForwardMin),
        ],
      }
    }
  }

  switch (input.msgBackend?.t) {
    case 'listed-spaces': {
      const merged = input.msgBackend.spaces.reduce(SpacesCoreFrontend.merge, input.model)
      return {
        model: {
          ...input.model,
          indexSpaceIdByUserId: merged.indexSpaceIdByUserId,
          spaces: merged.spaces,
          listSpacesRequest: RequestResponse.response(input.model.listSpacesRequest, input.ctx.now, Ok(null)),
        },
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

const toSpaces = (model: SpacesCoreFrontend.Model) => {
  const spaces: SpaceCoreState.Started[] = []
  for (const spaceId in model.spaces) {
    const started = SpacesCoreFrontend.toSpaceStarted(model, spaceId as SpaceId)
    if (started) {
      spaces.push(started)
    }
  }
  return spaces
}

const View: SpaceFrontendModule['View'] = (input) => {
  if (!input.ctx.currentUserId) {
    return null
  }

  const currentUserSpaceId = input.model.indexSpaceIdByUserId[input.ctx.currentUserId]

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
          <StartSpaceFrontend.ViewStartSpaceButton {...input} />
        </div>
      )}
    </div>
  )
}

export const ListSpacesFrontend = {
  init,
  update,
  View,
}
