import { RequestResponse, startedRequest } from '~/@/request-response/request-response'
import { Ok } from '~/@/result'
import type { SpaceId } from '~/app/@/data/space-id'
import { APP_SOUND, playSound, pushScreen, sendToBackend } from '~/app/@/frontend/cmd'
import { IconGamepad, TopBar } from '~/app/@/ui'
import { EmptyState } from '~/app/@/ui/empty-state'
import type { SpaceFrontendModule } from '../@/architecture/space-frontend'
import { SpaceFrontend } from '../space/frontend'
import { SpaceState } from '../space/space-state'
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
    msgCmd: [sendToBackend({ t: 'list-spaces', pagination: { limit: 1000, offset: 0 } })],
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
    case 'screen-evt.screen-changed': {
      if (input.msgEvt.screen.t === 'space-list') {
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
          pushScreen({ n: 'spaces', t: 'space', spaceId: input.msg.spaceId }),
          playSound(APP_SOUND.navForwardMin),
        ],
      }
    }
  }

  switch (input.msgBackend?.t) {
    case 'listed-spaces': {
      const merged = input.msgBackend.spaces.reduce(SpaceFrontend.merge, input.model)
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

const toSpaces = (model: SpaceFrontend.Model) => {
  const spaces: SpaceState.Started[] = []
  for (const spaceId in model.spaces) {
    const started = SpaceFrontend.toSpaceStarted(model, spaceId as SpaceId)
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

  return (
    <div className='relative flex w-full flex-1 flex-col overflow-hidden'>
      <TopBar onBack={false} ctx={input.ctx} center title={input.ctx.t('spaces.spaces')} />

      <div className='relative flex w-full flex-1 flex-col overflow-hidden overflow-y-scroll pb-8'>
        {spaces.length === 0 && (
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
