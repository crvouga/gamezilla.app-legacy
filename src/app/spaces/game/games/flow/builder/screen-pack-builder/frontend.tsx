import { Sub } from '~/@/sub'
import { Button, IconArrowLeftOnRect } from '~/app/@/ui'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { EditPackNameFrontend } from './edit-pack-name/frontend'
import { ScreenAddPuzzle } from './screen-add-puzzle/frontend'
import { ScreenPuzzlePlay } from './screen-play-puzzle/frontend'
import { ScreenPuzzleGrid } from './screen-puzzle-grid/frontend'
import type { FrontendModule } from './types'
import { PackDbQueryFrontend } from '../../@/pack/pack-db-query/frontend'
import { PuzzleDbQueryFrontend } from '../../@/puzzle/puzzle-db-query/frontend'

export const ScreenPackBuilderFrontend: Pick<FrontendModule, 'update' | 'View' | 'subscriptions'> = {
  update(input) {
    return GameFrontendModule.andThen(
      { model: input.model },
      (model) => ButtonExitBuilder.update({ ...input, model }),
      (model) => ScreenAddPuzzle.update({ ...input, model }),
      (model) => ScreenPuzzleGrid.update({ ...input, model }),
      (model) => ScreenPuzzlePlay.update({ ...input, model }),
      (model) => EditPackName.update({ ...input, model }),
      (model) => updateRecordPack({ ...input, model }),
      (model) => updateFromMsg({ ...input, model }),
    )
  },

  subscriptions(input) {
    return Sub.batch([ScreenAddPuzzle.subscriptions(input)])
  },

  View(input) {
    switch (input.modelSpace?.screen.t) {
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
  },
}

const updateFromMsg: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'got-msg-space': {
      return { model: input.model, msgSpace: [input.msg.c] }
    }
    case 'got-pack-db-query-msg': {
      return { model: input.model, msgCmd: [PackDbQueryFrontend.gotMsg(input.msg.c)] }
    }
    case 'got-puzzle-db-query-msg': {
      return { model: input.model, msgCmd: [PuzzleDbQueryFrontend.gotMsg(input.msg.c)] }
    }
    default: {
      return {
        model: input.model,
      }
    }
  }
}

const ButtonExitBuilder: Pick<FrontendModule, 'update' | 'View'> = {
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
            t: 'got-msg-space',
            c: {
              t: 'screen-pack-builder.user-clicked-back-button',
              userId: input.ctx.currentUserId,
            },
          })
        }
      />
    )
  },
}

const EditPackName: Pick<FrontendModule, 'update' | 'View'> = {
  update(input) {
    if (!input.modelSpace) {
      return {
        model: input.model,
      }
    }
    const updated = EditPackNameFrontend.update({
      ...input,
      modelSpace: input.modelSpace.editPackName,
      msg: input.msgSpace?.t === 'got-edit-pack-name-msg' ? input.msgSpace.c : null,
      msgSpace: input.msgSpace?.t === 'got-edit-pack-name-msg' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
    })
    return {
      model: input.model,
      msgSpace: (updated.msgSpace ?? []).map((c) => ({
        c,
        t: 'got-edit-pack-name-msg',
      })),
    }
  },
  View(input) {
    if (!input.modelSpace) {
      return null
    }
    return (
      <>
        <EditPackNameFrontend.ViewDrawer
          ctx={input.ctx}
          model={input.modelSpace.editPackName}
          modelSpace={input.modelSpace.editPackName}
          dispatch={(c) =>
            input.dispatch({
              t: 'got-msg-space',
              c: {
                t: 'got-edit-pack-name-msg',
                c,
              },
            })
          }
        />
      </>
    )
  },
}

const updateRecordPack: FrontendModule['update'] = (input) => {
  const hasMsg = input.msgSpace || input.msgCmd || input.msgEvt || input.msgBackend || input.msg
  if (hasMsg && input.modelSpace?.pack) {
    return {
      model: input.model,
      msgCmd: [
        {
          t: 'flow-cmd.add-packs',
          packs: {
            [input.modelSpace.pack.id]: input.modelSpace.pack,
          },
          causedBy: input,
        },
      ],
    }
  }
  return { model: input.model }
}
