import { withEventId } from '~/@/event-sourced/event'
import { isErr, RemoteResult, Result } from '~/@/result'
import { Posix } from '~/@/time/posix'
import { IconPlus } from '~/@/ui'
import { UserId } from '~/app/@/data/user-id'
import { APP_SOUND, playSound, showCreatedSm, showErrSm } from '~/app/@/frontend/cmd'
import { PostActionProps } from '~/app/@/ui/screen/layout/screen-layout-props'
import { FlowFrontendCmd } from '../../../../@/frontend/cmd'
import { Puzzle } from '../../../../@/puzzle/puzzle'
import { IPuzzleDb } from '../../../../@/puzzle/puzzle-db'
import { Variant, VariantDimensions } from '../../../../@/variant'
import { FrontendModule } from '../../../types'
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
          const result = await createNewPuzzle({
            createdByUserId: input.ctx.currentUser.userId,
            now: input.ctx.now,
            puzzleDb: input.ctx.puzzleDb,
          })
          dispatch({ t: 'create-new-puzzle.db-inserted-puzzle', result })
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
            userId: input.ctx.currentUser.userId,
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

const createNewPuzzle = async (input: { now: Posix; createdByUserId: UserId; puzzleDb: IPuzzleDb }) => {
  const puzzleNew = await Puzzle.create({
    createdAt: input.now,
    createdBy: input.createdByUserId,
    flow: Variant.init({
      terminalsByGroupId: {},
      dimensions: VariantDimensions.init({ t: 'flow-grid', height: 8, width: 8 }),
    }),
  })

  const result = await input.puzzleDb.put(puzzleNew)

  return Result.mapOk(result, () => puzzleNew)
}

const viewCreateAction = (input: Parameters<FrontendModule['View']>[0]): PostActionProps => {
  return {
    onSubmit: () => input.dispatch({ t: 'create-new-puzzle.user-clicked-create-button' }),
    submitText: input.ctx.t('flow.create-puzzle'),
    submitLoading: input.model.puzzleCreateRequest.t === 'loading',
    submitDisabled: input.model.puzzleCreateRequest.t === 'loading',
    submitIcon: (iconInput) => <IconPlus {...iconInput} />,
  }
}

export const CreateNewPuzzleFrontend = {
  update,
  viewCreateAction,
}
