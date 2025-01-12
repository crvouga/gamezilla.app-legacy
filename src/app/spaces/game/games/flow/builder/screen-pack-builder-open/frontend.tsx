import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { TopBar } from '~/app/@/ui'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { PackListFrontend } from '../../@/pack/pack-list'
import type { FrontendModule } from '../types'
import { PackCreateNewFrontend } from './create-new-pack/frontend'

const update: FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => updateMain({ ...input, model }),
    (model) => PackCreateNewFrontend.update({ ...input, model }),
  )
}

export const updateMain: FrontendModule['update'] = (input) => {
  switch (input.msgCore?.t) {
    case 'screen-pack-builder-open.user-clicked-pack-item': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navForwardMin)],
      }
    }
    default: {
      return {
        model: input.model,
      }
    }
  }
}

const View: FrontendModule['View'] = (input) => {
  return (
    <div className='relative flex h-full w-full flex-col items-center justify-center overflow-hidden'>
      <TopBar
        onBack={() =>
          input.dispatch({
            t: 'got-msg-core',
            c: {
              t: 'user-clicked-back-button',
              userId: input.ctx.currentUserId,
            },
          })
        }
        ctx={input.ctx}
        title={input.ctx.t('flow.pack-builder')}
      />
      <PackListFrontend.View
        {...input}
        dispatch={(_c) => {}}
        model={input.ctx.packList}
        slots={{
          fab: () => <PackCreateNewFrontend.ViewCreateFab {...input} />,
        }}
        emits={{
          clickedPackItem: (pack) =>
            input.dispatch({
              t: 'got-msg-core',
              c: {
                t: 'screen-pack-builder-open.user-clicked-pack-item',
                pack,
                userId: input.ctx.currentUserId,
              },
            }),
        }}
      />
    </div>
  )
}

export const ScreenPackBuilderOpenFrontend = {
  View,
  update,
}
