import { isErr, isLoading, Result } from '~/@/result'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { Time } from '~/@/time/time'
import { TimeSpan } from '~/@/time/time-span'
import { showCreatedSm, showErrSm } from '~/app/@/frontend/cmd'
import { Button, IconPlus } from '~/app/@/ui'
import { FlowFrontendCmd } from '../../../@/frontend/cmd'
import { Puzzle } from '../../../@/puzzle/puzzle'
import { Variant, VariantDimensions } from '../../../@/variant'
import { FrontendModule } from '../../types'
import { MsgFrontend, MsgToBackend } from './types'

const update: FrontendModule['update'] = (input) => {
  const { msgSpace, model, msg, ctx } = input

  switch (msg?.t) {
    case 'create-new-puzzle.user-clicked-create-button': {
      return {
        model,
        eff: async (_dispatch) => {
          const puzzleNew = await Puzzle.create({
            count: 0,
            createdAt: input.ctx.now,
            createdBy: input.ctx.currentUserId,
            flow: Variant.init({
              terminalsByGroupId: {},
              dimensions: VariantDimensions.init({ t: 'flow-grid', height: 8, width: 8 }),
            }),
          })

          const put = await ctx.puzzleDb.put(puzzleNew)

          console.log(put)
        },

        // msgCmd: [
        //   playSound(APP_SOUND.tap),
        //   sendToBackend<{
        //     MsgFrontend: MsgFrontend
        //     MsgToBackend: MsgToBackend
        //   }>({
        //     t: 'create-new-puzzle.user-clicked-create-button',
        //   }),
        // ],
      }
    }

    case 'time-passed': {
      if (
        isLoading(model.puzzleCreateRequest) &&
        TimeSpan.gte(Posix.diff(model.puzzleCreateRequestedAt, ctx.now), TimeSpan.seconds(5))
      ) {
        return {
          model: {
            ...model,
            puzzleCreateRequest: Result.Err(ctx.t('app.something-went-wrong')),
          },
          msgCmd: showErrSm<{
            MsgFrontend: MsgFrontend
            MsgToBackend: MsgToBackend
          }>(input.ctx.t('app.something-went-wrong')),
        }
      }
      return {
        model,
      }
    }

    default: {
      break
    }
  }

  switch (msgSpace?.t) {
    case 'create-new-puzzle.user-created-puzzle': {
      if (isErr(msgSpace.created)) {
        return {
          model: {
            ...model,
            puzzleCreateRequest: msgSpace.created,
          },
          msgCmd: showErrSm<{
            MsgFrontend: MsgFrontend
            MsgToBackend: MsgToBackend
          }>(input.ctx.t('app.something-went-wrong')),
        }
      }

      const puzzleNew = msgSpace.created.value

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
        model: {
          ...model,
          puzzleCreateRequest: Result.mapOk(msgSpace.created, () => null),
        },
        msgCmd,
      }
    }

    default: {
      break
    }
  }

  return { model }
}

const id = 'puzzle-create-request'

const subscriptions: FrontendModule['subscriptions'] = ({ model }) => {
  switch (model.puzzleCreateRequest.t) {
    case 'loading': {
      return Time.interval(id, TimeSpan.seconds(1), () => ({
        t: 'time-passed',
      }))
    }
    default: {
      return Sub.None
    }
  }
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
  subscriptions,
}
