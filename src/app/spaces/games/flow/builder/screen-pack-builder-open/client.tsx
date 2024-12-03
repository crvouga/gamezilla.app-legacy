import { APP_SOUND, playSound } from '~/app/@/client'
import { GameClientModule } from '~/app/spaces/games/@/architecture/game-client-v2'
import { PackListClient } from '../../@/pack/pack-list'
import type { ClientModule } from '../types'
import { PackCreateNewClient } from './create-new-pack/client'
import { TopBar } from '~/app/@/ui'

const update: ClientModule['update'] = (input) => {
  return GameClientModule.andThen(
    { model: input.model },
    (model) => updateMain({ ...input, model }),
    (model) => PackCreateNewClient.update({ ...input, model })
  )
}

export const updateMain: ClientModule['update'] = (input) => {
  switch (input.msgCore?.t) {
    case 'screen-pack-builder-open.user-clicked-pack-item': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navForwardMin)]
      }
    }
    default: {
      return {
        model: input.model
      }
    }
  }
}

const View: ClientModule['View'] = (input) => {
  return (
    <div className='relative flex h-full w-full flex-col items-center justify-center overflow-hidden'>
      <TopBar
        onBack={() =>
          input.dispatch({
            t: 'got-msg-core',
            c: {
              t: 'user-clicked-back-button',
              userId: input.ctx.currentUserId
            }
          })
        }
        ctx={input.ctx}
        title={input.ctx.t('flow.pack-builder')}
      />
      <PackListClient.View
        {...input}
        dispatch={(_c) => {}}
        model={input.ctx.packList}
        slots={{
          fab: () => <PackCreateNewClient.ViewCreateFab {...input} />
        }}
        emits={{
          clickedPackItem: (pack) =>
            input.dispatch({
              t: 'got-msg-core',
              c: {
                t: 'screen-pack-builder-open.user-clicked-pack-item',
                pack,
                userId: input.ctx.currentUserId
              }
            })
        }}
      />
    </div>
  )
}

export const ScreenPackBuilderOpenClient = {
  View,
  update
}
