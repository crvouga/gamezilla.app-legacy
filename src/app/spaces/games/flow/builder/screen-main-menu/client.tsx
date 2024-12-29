import { APP_SOUND, playSound } from '~/app/@/client'
import { IconBox, IconPuzzlePiece, IconScrewdriverWrench } from '~/app/@/ui'
import { andThen } from '~/app/spaces/games/@/architecture/game-client-v2'
import type { ClientModule } from '../types'
import { GameMainMenu } from '../../../@/game/game-main-menu'

const update: ClientModule['update'] = (input) => {
  return andThen({ model: input.model }, (model) => updateFromMsgCore({ ...input, model }))
}

const updateFromMsgCore: ClientModule['update'] = (input) => {
  switch (input.msgCore?.t) {
    case 'flow.builder.screen-main-menu.user-clicked-option': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navForwardMin)]
      }
    }

    case 'screen-main-menu.user-clicked-back-button': {
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
    <GameMainMenu.View
      ctx={input.ctx}
      dispatch={(c) => input.dispatch(c)}
      onBack={() =>
        input.dispatch({
          t: 'got-msg-core',
          c: {
            t: 'screen-main-menu.user-clicked-back-button',
            userId: input.ctx.currentUserId
          }
        })
      }
      renderCoverArt={(input) => (
        <div {...input} key={input.key}>
          <div className='h-full w-full p-4'>
            <IconScrewdriverWrench className='h-full w-full' />
          </div>
        </div>
      )}
      title={input.ctx.t('flow.builder')}
      buttons={[
        {
          renderIcon: (input) => <IconPuzzlePiece {...input} />,
          title: input.ctx.t('flow.open-puzzle-builder-title'),
          description: input.ctx.t('flow.open-puzzle-builder-description'),
          onClick: () =>
            input.dispatch({
              t: 'got-msg-core',
              c: {
                t: 'flow.builder.screen-main-menu.user-clicked-option',
                option: 'puzzle-builder',
                userId: input.ctx.currentUserId
              }
            })
        },
        {
          renderIcon: (input) => <IconBox {...input} />,
          title: input.ctx.t('flow.open-pack-builder-title'),
          description: input.ctx.t('flow.open-pack-builder-description'),
          onClick: () =>
            input.dispatch({
              t: 'got-msg-core',
              c: {
                t: 'flow.builder.screen-main-menu.user-clicked-option',
                option: 'pack-builder',
                userId: input.ctx.currentUserId
              }
            })
        }
      ]}
    />
  )
}

export const ScreenMainMenuClient = {
  update,
  View
}
