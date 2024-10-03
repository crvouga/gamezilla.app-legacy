import { APP_SOUND, playSound } from 'gamezilla-app/app/@/client'
import { TopBar } from 'gamezilla-app/app/@/ui'
import { withId } from 'gamezilla-app/app/spaces/@/event'
import { GameClientModule } from 'gamezilla-app/app/spaces/game/@/architecture/game-client-v2'
import { FlowPackListClient } from '../../@/pack/flow-pack-list'
import type { ClientModule } from '../play.types'

const update: ClientModule['update'] = (input) => {
  return GameClientModule.andThen(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromMsgCore({ ...input, model }),
    (model) => updatePackListLoad({ ...input, model })
  )
}

const updatePackListLoad: ClientModule['update'] = (input) => {
  if (
    input.msgEvt?.t === 'flow.user-changed-mode' ||
    input.msgEvt?.t === 'space/synced' ||
    input.msgCore?.t === 'user-clicked-exit-pack-button' ||
    input.msgCore?.t === 'user-clicked-select-next-pack'
  ) {
    return {
      model: input.model,
      msgCmd: [FlowPackListClient.load()]
    }
  }

  return { model: input.model }
}

const updateFromMsg: ClientModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'user-clicked-open-pack-list-item': {
      return {
        model: input.model,
        msgCore: [withId(input.msg)]
      }
    }
    default: {
      return {
        model: input.model
      }
    }
  }
}

const updateFromMsgCore: ClientModule['update'] = (input) => {
  switch (input.msgCore?.t) {
    case 'user-clicked-open-pack-list-item': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navForwardMin)]
      }
    }
    case 'user-clicked-exit-play-mode-button': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navBackwardMin)]
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
    <div className='flex h-full w-full flex-1 flex-col'>
      <TopBar
        ctx={input.ctx}
        onBack={() =>
          input.dispatch({
            t: 'user-clicked-exit-play-mode-button',
            userId: input.ctx.currentUserId
          })
        }
        title={input.ctx.t('flow.play')}
      />
      <FlowPackListClient.View
        ctx={input.ctx}
        dispatch={(_c) => {}}
        model={input.ctx.flowPackList}
        emits={{
          clickedPackItem(pack) {
            input.dispatch({ t: 'user-clicked-open-pack-list-item', pack })
          }
        }}
      />
    </div>
  )
}

export const ScreenSelectPackClient = {
  update,
  View
}
