import { isErr, isLoading, Loading, Result } from '~/@/core'
import { Posix } from '~/@/time/posix'
import { Time } from '~/@/time/time'
import { TimeSpan } from '~/@/time/time-span'
import { APP_SOUND, playSound, sendToServer, showCreatedSm, showErrSm } from '~/app/@/client'
import { Button, IconPlus } from '~/app/@/ui'
import { FlowClientCmd } from '../../../@/client/cmd'
import { ClientModule } from '../../types'
import { MsgClient, MsgToServer } from './types'
import { Sub } from '~/@/program/sub'

const update: ClientModule['update'] = (input) => {
  const { msgCore, model, msg, ctx } = input

  switch (msg?.t) {
    case 'create-new-puzzle.user-clicked-create-button': {
      return {
        model: {
          ...model,
          puzzleCreateRequest: Loading,
          puzzleCreateRequestedAt: ctx.now
        },
        msgCmd: [
          playSound(APP_SOUND.tap),
          sendToServer<{
            MsgClient: MsgClient
            MsgToServer: MsgToServer
          }>({
            t: 'create-new-puzzle.user-clicked-create-button'
          })
        ]
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
            puzzleCreateRequest: Result.Err(ctx.t('app.something-went-wrong'))
          },
          msgCmd: showErrSm<{
            MsgClient: MsgClient
            MsgToServer: MsgToServer
          }>(input.ctx.t('app.something-went-wrong'))
        }
      }
      return {
        model
      }
    }

    default: {
      break
    }
  }

  switch (msgCore?.t) {
    case 'create-new-puzzle.user-created-puzzle': {
      if (isErr(msgCore.created)) {
        return {
          model: {
            ...model,
            puzzleCreateRequest: msgCore.created
          },
          msgCmd: showErrSm<{
            MsgClient: MsgClient
            MsgToServer: MsgToServer
          }>(input.ctx.t('app.something-went-wrong'))
        }
      }

      const puzzleNew = msgCore.created.value

      const msgCmd: FlowClientCmd<{
        MsgClient: MsgClient
        MsgToServer: MsgToServer
      }>[] = [
        ...showCreatedSm<{
          MsgClient: MsgClient
          MsgToServer: MsgToServer
        }>(input.ctx.t('flow.puzzle-created')),
        {
          t: 'flow.new-puzzles',
          puzzles: {
            [puzzleNew.id]: puzzleNew
          },
          causedBy: input
        }
      ]

      return {
        model: {
          ...model,
          puzzleCreateRequest: Result.mapOk(msgCore.created, () => null)
        },
        msgCmd
      }
    }

    default: {
      break
    }
  }

  return { model }
}

const id = 'puzzle-create-request'

const subscriptions: ClientModule['subscriptions'] = ({ model }) => {
  switch (model.puzzleCreateRequest.t) {
    case 'loading': {
      return Time.interval(id, TimeSpan.seconds(1), () => ({
        t: 'time-passed'
      }))
    }
    default: {
      return Sub.None
    }
  }
}

const ViewCreateFab: ClientModule['View'] = (input) => {
  return (
    <Button
      text={input.ctx.t('flow.create-puzzle')}
      variant='contained'
      color='primary'
      rounded
      loading={input.model.puzzleCreateRequest.t === 'loading'}
      iconStart={(iconInput) => <IconPlus {...iconInput} />}
      onClick={() =>
        input.dispatch({
          t: 'create-new-puzzle.user-clicked-create-button'
        })
      }
    />
  )
}

export const CreateNewPuzzleClient = {
  update,
  ViewCreateFab,
  subscriptions
}
