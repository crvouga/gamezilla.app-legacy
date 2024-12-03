import { GameClientModule } from 'app/spaces/games/@/architecture/game-client-v2'
import { APP_SOUND, playSound, sendToServer, showErrSm, showCreatedSm } from 'app/@/client'
import { Button, Drawer, IconPenToSquare, ListItemButton, TextField } from 'app/@/ui'
import { isLoading, isOk, Loading } from '@/core'
import { FlowPuzzleName } from '../../../@/puzzle/puzzle-name'
import type { ClientModule } from '../../types'
import { editNameValidationErrorToString, MsgClient, MsgToServer } from './types'
import type { VDomChildren } from '@/vdom'
import { FlowClientCmd } from '../../../@/flow-client-cmd'

//
//
//
//
//
//

const update: ClientModule['update'] = (input) => {
  const { model } = input
  return GameClientModule.andThen(
    { model },
    (model) =>
      updateDraftNameInput({
        ...input,
        model
      }),
    (model) =>
      updateDrawer({
        ...input,
        model
      }),
    (model) =>
      updateFormButtons({
        ...input,
        model
      })
  )
}

const View: ClientModule['View'] = (input) => {
  return (
    <ViewDrawer {...input}>
      <p className='px-4 pt-4 text-2xl font-bold'>Edit name</p>
      <ViewDraftNameInput {...input} />
      <ViewFormButtons {...input} />
    </ViewDrawer>
  )
}

//
//
//
//
//

const updateFormButtons: ClientModule['update'] = (input) => {
  const puzzleBuilder = input.modelCore.screenPuzzleBuilder

  if (!puzzleBuilder) {
    return { model: input.model }
  }

  switch (input.msg?.t) {
    case 'puzzle.edit-name.user-clicked-cancel-button': {
      return {
        model: {
          ...input.model,
          puzzleBuilderOpened: 'more',
          puzzleEditNameValidationError: null
        }
      }
    }

    case 'puzzle.edit-name.user-clicked-save-button': {
      const newName = input.model.puzzleEditNameDraft ?? ''

      if (newName.length === 0) {
        return {
          model: {
            ...input.model,
            puzzleEditNameValidationError: 'name-cannot-be-empty'
          },
          msgCmd: [playSound(APP_SOUND.alertErrorSm)]
        }
      }

      return {
        model: {
          ...input.model,
          puzzleEditNameRequest: Loading,
          puzzleEditNameValidationError: null
        },
        msgCmd: [
          playSound(APP_SOUND.tap),
          sendToServer({
            t: 'puzzle.edit-name.user-clicked-save-button',
            newName,
            flowPuzzleId: puzzleBuilder.puzzle.id
          })
        ]
      }
    }
  }

  switch (input.msgCore?.t) {
    case 'user-edited-puzzle-name': {
      const puzzlesNew = {
        ...input.ctx.puzzles
      }
      const puzzle = puzzlesNew[input.msgCore.flowPuzzleId]

      if (puzzle && FlowPuzzleName.is(input.msgCore.newName)) {
        puzzlesNew[input.msgCore.flowPuzzleId] = {
          ...puzzle,
          name: input.msgCore.newName
        }
      }

      const msgCmd: FlowClientCmd<{
        MsgClient: MsgClient
        MsgToServer: MsgToServer
      }>[] = [
        ...(isOk(input.msgCore.edited)
          ? showCreatedSm<{
              MsgClient: MsgClient
              MsgToServer: MsgToServer
            }>(input.ctx.t('flow.saved-name'))
          : showErrSm<{
              MsgClient: MsgClient
              MsgToServer: MsgToServer
            }>(input.ctx.t('app.something-went-wrong'))),
        {
          t: 'flow.new-puzzles',
          puzzles: puzzlesNew,
          causedBy: input
        }
      ]

      return {
        model: {
          ...input.model,
          puzzleEditNameRequest: input.msgCore.edited,
          puzzleBuilderOpened: null
        },
        msgCmd
      }
    }
  }

  return { model: input.model }
}

const ViewFormButtons: ClientModule['View'] = (input) => {
  return (
    <div className='flex w-full items-center gap-4 p-4 pb-6'>
      <Button
        className='flex-1'
        text={input.ctx.t('app.cancel')}
        onClick={() =>
          input.dispatch({
            t: 'puzzle.edit-name.user-clicked-cancel-button'
          })
        }
      />
      <Button
        className='flex-1'
        color='primary'
        variant='contained'
        text={input.ctx.t('app.save')}
        loading={isLoading(input.model.puzzleEditNameRequest)}
        disabled={
          input.modelCore.screen.t !== 'screen-puzzle-builder' ||
          input.model.puzzleEditNameDraft === input.modelCore.screenPuzzleBuilder?.puzzle.name
        }
        onClick={() =>
          input.dispatch({
            t: 'puzzle.edit-name.user-clicked-save-button'
          })
        }
      />
    </div>
  )
}

//
//
//
//
//

const updateDrawer: ClientModule['update'] = (input) => {
  const { msg, model, modelCore } = input

  switch (msg?.t) {
    case 'puzzle.edit-name.user-clicked-button': {
      return {
        model: {
          ...model,
          puzzleBuilderOpened: 'edit-name',
          puzzleEditNameDraft: modelCore.screenPuzzleBuilder?.puzzle.name ?? ''
        }
      }
    }

    case 'puzzle.edit-name.user-closed-drawer': {
      return {
        model: {
          ...model,
          puzzleBuilderOpened: null
        }
      }
    }

    default: {
      return {
        model
      }
    }
  }
}

const ViewDrawer = (
  input: Parameters<ClientModule['View']>[0] & {
    children: VDomChildren
  }
) => {
  const { children, dispatch, model } = input
  return (
    <>
      <ListItemButton
        icon={(input) => <IconPenToSquare {...input} />}
        label={input.ctx.t('puzzle.edit-name')}
        onClick={() =>
          dispatch({
            t: 'puzzle.edit-name.user-clicked-button'
          })
        }
      />

      <Drawer
        id='edit-name-drawer'
        open={model.puzzleBuilderOpened === 'edit-name'}
        onClose={() =>
          dispatch({
            t: 'puzzle.edit-name.user-closed-drawer'
          })
        }
        position='bottom'
      >
        {children}
      </Drawer>
    </>
  )
}

//
//
//
//
//
//

const updateDraftNameInput: ClientModule['update'] = ({ model, msg }) => {
  switch (msg?.t) {
    case 'puzzle.edit-name.user-inputted-draft-name': {
      return {
        model: {
          ...model,
          puzzleEditNameDraft: msg.draftName,
          puzzleEditNameValidationError: null
        }
      }
    }
    default: {
      return {
        model
      }
    }
  }
}

const ViewDraftNameInput: ClientModule['View'] = (input) => {
  return (
    <div className='w-full p-4'>
      <TextField
        id='edit-name-input'
        label={input.ctx.t('flow.edit-puzzle-name.name')}
        value={input.model.puzzleEditNameDraft}
        onChange={(draftName) =>
          input.dispatch({
            t: 'puzzle.edit-name.user-inputted-draft-name',
            draftName
          })
        }
        error={Boolean(input.model.puzzleEditNameValidationError)}
        helperText={editNameValidationErrorToString(input.ctx.t, input.model.puzzleEditNameValidationError)}
      />
    </div>
  )
}

//
//
//
//
//
//

export const EditPuzzleNameClient = {
  update,
  View
}
