import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { IconGamepad, TopBar } from '~/app/@/ui'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { LayoutGameCoverArtHeader } from '../../../@/ui/layout-game-cover-art-header'
import { ViewUsersInSpaceList } from '../../../@/ui/users-in-space-list'
import { PackListFrontend } from '../../@/pack/pack-list'
import type { FrontendModule } from '../types'

const update: FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromMsgCore({ ...input, model }),
    (model) => updateLoadPacks({ ...input, model }),
  )
}

const updateLoadPacks: FrontendModule['update'] = (input) => {
  if (
    input.msgEvt?.t === 'flow-evt.user-changed-mode' ||
    input.msgEvt?.t === 'space-evt.synced' ||
    input.msgCore?.t === 'user-clicked-exit-pack-button' ||
    input.msgCore?.t === 'user-clicked-select-next-pack'
  ) {
    return {
      model: input.model,
      msgCmd: [PackListFrontend.load()],
    }
  }

  return { model: input.model }
}

const updateFromMsgCore: FrontendModule['update'] = (input) => {
  switch (input.msgCore?.t) {
    case 'user-clicked-open-pack-list-item': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navForwardMin)],
      }
    }
    case 'user-clicked-exit-play-mode-button': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navBackwardMin)],
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
  if (input.ctx.currentUserId !== input.ctx.space.hostId) {
    return (
      <LayoutGameCoverArtHeader
        ctx={input.ctx}
        onBack={false}
        title={input.ctx.t('flow.play')}
        renderCoverArt={(input) => (
          <div {...input}>
            <div className='h-full w-full p-4'>
              <IconGamepad className='h-full w-full' />
            </div>
          </div>
        )}
        renderContent={() => (
          <ViewUsersInSpaceList
            onOpenUserDetails={(userId) =>
              input.dispatch({
                t: 'game-main-menu.clicked-open-user-details-button',
                userId,
              })
            }
            ctx={input.ctx}
          />
        )}
      />
    )
  }

  return (
    <div className='flex h-full w-full flex-1 flex-col'>
      <TopBar
        ctx={input.ctx}
        onBack={() =>
          input.dispatch({
            t: 'got-msg-core',
            c: {
              t: 'user-clicked-exit-play-mode-button',
              userId: input.ctx.currentUserId,
            },
          })
        }
        title={input.ctx.t('flow.play')}
      />
      <PackListFrontend.View
        ctx={input.ctx}
        dispatch={(_c) => {}}
        model={input.ctx.packList}
        emits={{
          clickedPackItem(pack) {
            input.dispatch({ t: 'got-msg-core', c: { t: 'user-clicked-open-pack-list-item', pack } })
          },
        }}
      />
    </div>
  )
}

export const ScreenSelectPackFrontend = {
  update,
  View,
}
