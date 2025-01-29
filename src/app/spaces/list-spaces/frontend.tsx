import { RequestResponse, startedRequest } from '~/@/request-response/request-response'
import { Ok } from '~/@/result'
import { IconGamepad } from '~/@/ui'
import { EmptyState } from '~/@/ui/empty-state'
import { Gutter } from '~/@/ui/gutter'
import type { SpaceId } from '~/app/@/data/space-id'
import { APP_SOUND, playSound, pushScreen, sendToBackend } from '~/app/@/frontend/cmd'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { ScreenBodyRoot } from '~/app/@/ui/screen/layout/screen-body-root'
import type { SpaceFrontendModule } from '../@/architecture/space-frontend'
import { SpacesCore } from '../core/core'
import { SpaceState } from '../core/space-state'
import { StartSpaceFrontend } from '../start-space/frontend'
import { ViewSpaceCard } from './space-card/space-card'

const sendListSpacesRequest: SpaceFrontendModule['update'] = ({ model, ctx }) => {
  if (model.listSpacesRequest.t === 'loading') return { model }

  return {
    model: { ...model, listSpacesRequest: startedRequest(ctx.now) },
    msgCmd: [sendToBackend({ t: 'list-spaces', pagination: { limit: 1000, offset: 0 } })],
  }
}

const init: SpaceFrontendModule['init'] = ({ model, ctx }) => {
  return sendListSpacesRequest({ model, ctx })
}

const update: SpaceFrontendModule['update'] = (input) => {
  switch (input.msgEvt?.t) {
    case 'screen-evt.screen-changed': {
      if (input.msgEvt.screen.t === 'space-list') {
        return sendListSpacesRequest(input)
      }
      return { model: input.model }
    }

    case 'wire-evt.backend-connected': {
      return sendListSpacesRequest(input)
    }
  }

  switch (input.msg?.t) {
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
      const merged = input.msgBackend.spaces.reduce(SpacesCore.merge, input.model)
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

const toSpaces = (model: SpacesCore.Model) => {
  const spaces: SpaceState.Started[] = []
  for (const spaceId in model.spaces) {
    const started = SpacesCore.toSpaceStarted(model, spaceId as SpaceId)
    if (started) {
      spaces.push(started)
    }
  }
  return spaces
}

const View: SpaceFrontendModule['View'] = (input) => {
  if (!input.ctx.currentUserId) return null

  const spaces = toSpaces(input.model)

  return (
    <ScreenLayout
      isTopLevel
      id='list-spaces'
      ctx={input.ctx}
      navBar={{
        title: input.ctx.t('spaces.spaces'),
      }}
      parentScreen={input.ctx.parentScreen}
      createAction={StartSpaceFrontend.viewStartSpaceButton(input)}
      renderBody={() => {
        return (
          <ScreenBodyRoot className='flex flex-col'>
            {spaces.length === 0 && (
              <EmptyState renderIcon={(input) => <IconGamepad {...input} />} label={input.ctx.t('spaces.no-spaces')} />
            )}

            <div className='flex flex-1 flex-col gap-4 overflow-y-auto p-6'>
              {spaces.flatMap((state) => (
                <ViewSpaceCard
                  key={state.spaceId}
                  ctx={{ ...input.ctx, currentUserId: input.ctx.currentUserId }}
                  onClick={() => input.dispatch({ t: 'clicked-space-card', spaceId: state.spaceId })}
                  state={state}
                />
              ))}
            </div>

            <Gutter variant='screen' />
          </ScreenBodyRoot>
        )
      }}
    />
  )
}

export const ListSpacesFrontend = {
  init,
  update,
  View,
}
