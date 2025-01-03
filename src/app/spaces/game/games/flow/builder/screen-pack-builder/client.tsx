import { Button, IconArrowLeftOnRect } from '~/app/@/ui'
import { GameClientModule } from '~/app/spaces/game/games/@/architecture/game-client-v2'
import type { ClientModule } from '../types'
import { EditPackNameClient } from './edit-pack-name/client'
import { ScreenAddPuzzle } from './screen-add-puzzle/client'
import { ScreenPuzzlePlay } from './screen-play-puzzle/client'
import { ScreenPuzzleGrid } from './screen-puzzle-grid/client'

export const ScreenPackBuilderClient: Pick<ClientModule, 'update' | 'View'> = {
  update(input) {
    return GameClientModule.andThen(
      { model: input.model },
      (model) => ButtonExitBuilder.update({ ...input, model }),
      (model) => ScreenAddPuzzle.update({ ...input, model }),
      (model) => ScreenPuzzleGrid.update({ ...input, model }),
      (model) => ScreenPuzzlePlay.update({ ...input, model }),
      (model) => EditPackName.update({ ...input, model }),
      (model) => updateRecordPack({ ...input, model })
    )
  },

  View(input) {
    switch (input.modelCore.screenPackBuilder?.screen.t) {
      case 'screen-add-puzzle': {
        return <ScreenAddPuzzle.View {...input} />
      }

      case 'screen-puzzle-grid': {
        return <ScreenPuzzleGrid.View {...input} />
      }

      case 'screen-puzzle': {
        return <ScreenPuzzlePlay.View {...input} />
      }

      default: {
        return null
      }
    }
  }
}

const ButtonExitBuilder: Pick<ClientModule, 'update' | 'View'> = {
  update(input) {
    return { model: input.model }
  },

  View(input) {
    return (
      <Button
        iconStart={(inputIcons) => <IconArrowLeftOnRect {...inputIcons} />}
        className='w-full'
        text={input.ctx.t('app.exit')}
        onClick={() =>
          input.dispatch({
            t: 'got-msg-core',
            c: {
              t: 'user-clicked-back-button',
              userId: input.ctx.currentUserId
            }
          })
        }
      />
    )
  }
}

const EditPackName: Pick<ClientModule, 'update' | 'View'> = {
  update(input) {
    if (!input.modelCore.screenPackBuilder) {
      return {
        model: input.model
      }
    }
    const updated = EditPackNameClient.update({
      ...input,
      modelCore: input.modelCore.screenPackBuilder.editPackName,
      msg: input.msgCore?.t === 'got-edit-pack-name-msg' ? input.msgCore.c : null,
      msgCore: input.msgCore?.t === 'got-edit-pack-name-msg' ? { ...input.msgCore, ...input.msgCore.c } : null
    })
    return {
      model: input.model,
      msgCore: (updated.msgCore ?? []).map((c) => ({
        c,
        t: 'got-edit-pack-name-msg'
      }))
    }
  },
  View(input) {
    if (!input.modelCore.screenPackBuilder) {
      return null
    }
    return (
      <>
        <EditPackNameClient.ViewDrawer
          ctx={input.ctx}
          model={input.modelCore.screenPackBuilder.editPackName}
          modelCore={input.modelCore.screenPackBuilder.editPackName}
          dispatch={(c) =>
            input.dispatch({
              t: 'got-msg-core',
              c: {
                t: 'got-edit-pack-name-msg',
                c
              }
            })
          }
        />
      </>
    )
  }
}

const updateRecordPack: ClientModule['update'] = (input) => {
  const hasMsg = input.msgCore || input.msgCmd || input.msgEvt || input.msgServer || input.msg
  if (hasMsg && input.modelCore.screenPackBuilder?.pack) {
    return {
      model: input.model,
      msgCmd: [
        {
          t: 'flow-cmd.new-packs',
          packs: {
            [input.modelCore.screenPackBuilder.pack.id]: input.modelCore.screenPackBuilder.pack
          },
          causedBy: input
        }
      ]
    }
  }
  return { model: input.model }
}
