import { EmptyState } from '~/@/ui/empty-state'
import { Gutter } from '~/@/ui/gutter'
import { IconGamepad } from '~/@/ui/icon/icon-gamepad'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd'
import { ScreenChangedEvt } from '~/app/@/frontend/screen-changed-evt'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import type { SpaceFrontendModule } from '../architecture/space-frontend'
import { SpacesCore } from '../core/core'
import { StartSpaceFrontend } from '../start-space/frontend'
import { ViewSpaceCard } from './space-card/space-card'
import { unwrapOr } from '~/@/result'

const update: SpaceFrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'list-spaces.clicked-space-card': {
      return {
        model: input.model,
        msgOut: [
          PushScreenCmd.init({ n: 'spaces', t: 'space', spaceId: input.msg.spaceId }),
          PlaySoundCmd.init(APP_SOUND.navForwardMin),
        ],
      }
    }
    case 'list-spaces.list-spaces-response': {
      return {
        model: {
          ...input.model,
          listSpacesRequest: input.msg.spaces,
          spaces: unwrapOr(input.msg.spaces, { spaces: [] }).spaces.reduce(SpacesCore.mergeOne, input.model.spaces),
        },
      }
    }
  }

  if (ScreenChangedEvt.is(input.msgIn)) {
    return {
      model: input.model,
      async eff(dispatch) {
        const spaces = await input.ctx.rpc['spaces.list-spaces.list']({ pagination: { limit: 10, offset: 0 } })

        dispatch({ t: 'list-spaces.list-spaces-response', spaces })
      },
    }
  }

  return { model: input.model }
}

const View: SpaceFrontendModule['View'] = (input) => {
  if (!input.ctx.currentUser?.userId) return null

  const spaces = SpacesCore.toSpaces(input.model.spaces)

  return (
    <ScreenLayout
      parentScreen={input.ctx.parentScreen}
      id='list-spaces'
      ctx={input.ctx}
      navBar={{
        title: input.ctx.t('spaces.spaces'),
      }}
      postAction={StartSpaceFrontend.viewStartSpaceButton(input)}
      renderBody={() => {
        if (spaces.length === 0)
          return (
            <EmptyState renderIcon={(input) => <IconGamepad {...input} />} label={input.ctx.t('spaces.no-spaces')} />
          )
        return (
          <div className='flex flex-1 flex-col gap-4 overflow-y-auto p-6'>
            {spaces.map((state) => (
              <ViewSpaceCard
                key={state.spaceId}
                ctx={{ ...input.ctx, currentUser: input.ctx.currentUser }}
                onClick={() => input.dispatch({ t: 'list-spaces.clicked-space-card', spaceId: state.spaceId })}
                state={state}
              />
            ))}
            <Gutter variant='screen' />
          </div>
        )
      }}
    />
  )
}

export const ListSpacesFrontend = {
  update,
  View,
}
