import { withEventId } from '~/@/event-sourced/event'
import { isErr, RemoteResult, Result } from '~/@/result'
import { APP_SOUND, playSound, showCreatedSm, showErrSm } from '~/app/@/frontend/cmd'
import { Button, IconPlus } from '~/app/@/ui'
import { FlowFrontendCmd } from '../../../@/frontend/cmd'
import { Puzzle } from '../../../@/puzzle/puzzle'
import { Variant, VariantDimensions } from '../../../@/variant'
import { FrontendModule } from '../../types'
import { MsgFrontend, MsgToBackend } from './types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'create-new-puzzle.user-clicked-create-button': {
      return {
        model: {
          ...input.model,
          puzzleCreateRequest: RemoteResult.Loading,
        },
        msgCmd: [playSound(APP_SOUND.tap)],
        async eff(dispatch) {
          const puzzleNew = await Puzzle.create({
            createdAt: input.ctx.now,
            createdBy: input.ctx.currentUserId,
            flow: Variant.init({
              terminalsByGroupId: {},
              dimensions: VariantDimensions.init({ t: 'flow-grid', height: 8, width: 8 }),
            }),
          })

          const result = await input.ctx.puzzleDb.put(puzzleNew)

          dispatch({
            t: 'create-new-puzzle.db-inserted-puzzle',
            result: Result.mapOk(result, () => puzzleNew),
          })
        },
      }
    }

    case 'create-new-puzzle.db-inserted-puzzle': {
      return {
        model: {
          ...input.model,
          puzzleCreateRequest: input.msg.result,
        },
        msgSpace: [
          withEventId({
            t: 'create-new-puzzle.user-created-puzzle',
            created: input.msg.result,
            userId: input.ctx.currentUserId,
          }),
        ],
      }
    }

    default: {
      break
    }
  }

  switch (input.msgSpace?.t) {
    case 'create-new-puzzle.user-created-puzzle': {
      if (isErr(input.msgSpace.created)) {
        return {
          model: input.model,
          msgCmd: showErrSm<{
            MsgFrontend: MsgFrontend
            MsgToBackend: MsgToBackend
          }>(input.ctx.t('app.something-went-wrong')),
        }
      }

      const puzzleNew = input.msgSpace.created.value

      const msgCmd: FlowFrontendCmd<{
        MsgFrontend: MsgFrontend
        MsgToBackend: MsgToBackend
      }>[] = [
        ...showCreatedSm<{
          MsgFrontend: MsgFrontend
          MsgToBackend: MsgToBackend
        }>(input.ctx.t('flow.puzzle-created')),
        {
          t: 'flow-cmd.add-puzzles',
          puzzles: {
            [puzzleNew.id]: puzzleNew,
          },
          causedBy: input,
        },
      ]

      return {
        model: input.model,
        msgCmd,
      }
    }

    default: {
      break
    }
  }

  return { model: input.model }
}

const ViewCreateFab: FrontendModule['View'] = (input) => {
  return (
    <Button
      text={input.ctx.t('flow.create-puzzle')}
      variant='contained'
      color='primary'
      rounded
      loading={input.model.puzzleCreateRequest.t === 'loading'}
      iconStart={(iconInput) => <IconPlus {...iconInput} />}
      onClick={() => input.dispatch({ t: 'create-new-puzzle.user-clicked-create-button' })}
    />
  )
}

export const CreateNewPuzzleFrontend = {
  update,
  ViewCreateFab,
}
