import { APP_SOUND, playSound } from 'gamezilla-app/app/@/client'
import { IconPuzzlePiece } from 'gamezilla-app/app/@/ui'
import { withEventId } from 'gamezilla-app/app/spaces/@/event'
import { andThen } from 'gamezilla-app/app/spaces/game/@/architecture/game-client-v2'
import { GameMainMenu } from '../../../@/game'
import { FlowCoverArt } from '../../@/flow-cover-art'
import type { ClientModule } from '../types'

const update: ClientModule['update'] = (input) => {
  return andThen(
    { model: input.model },
    (model) => updateListTab({ ...input, model }),
    (model) => updateUserChangedListTab({ ...input, model })
  )
}

const updateUserChangedListTab: ClientModule['update'] = (input) => {
  switch (input.msgCore?.t) {
    case 'screen-main-menu.user-clicked-option': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.tap)]
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

const updateListTab: ClientModule['update'] = (input) => {
  const { msg } = input

  if (!msg) {
    return { model: input.model }
  }

  switch (msg.t) {
    case 'screen-main-menu.user-clicked-option':
    case 'screen-main-menu.user-clicked-back-button': {
      return {
        model: input.model,
        msgCore: [withEventId(msg)]
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
          t: 'screen-main-menu.user-clicked-back-button',
          userId: input.ctx.currentUserId
        })
      }
      renderCoverArt={(input) => <FlowCoverArt {...input} key={input.key} />}
      title={input.ctx.t('flow.builder')}
      buttons={[
        {
          renderIcon: (input) => <IconPuzzlePiece {...input} />,
          title: input.ctx.t('flow.puzzles'),
          description: input.ctx.t('flow.play-description'),
          onClick: () =>
            input.dispatch({
              t: 'screen-main-menu.user-clicked-option',
              option: 'puzzles',
              userId: input.ctx.currentUserId
            })
        },
        {
          renderIcon: (input) => <IconPuzzlePiece {...input} />,
          title: input.ctx.t('flow.puzzles'),
          description: input.ctx.t('flow.play-description'),
          onClick: () =>
            input.dispatch({
              t: 'screen-main-menu.user-clicked-option',
              option: 'puzzles',
              userId: input.ctx.currentUserId
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
