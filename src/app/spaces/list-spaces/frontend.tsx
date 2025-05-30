import { EmptyState } from '~/@/ui/empty-state'
import { Gutter } from '~/@/ui/gutter'
import { IconGamepad } from '~/@/ui/icon/icon-gamepad'
import { APP_SOUND } from '~/app/@/frontend/cmd'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd'
import { PushScreenCmd } from '~/app/@/frontend/push-screen-cmd'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import type { SpaceFrontendModule } from '../architecture/space-frontend'
import { SpacesCore } from '../core/core'
import { StartSpaceFrontend } from '../start-space/frontend'
import { ViewSpaceCard } from './space-card/space-card'

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
