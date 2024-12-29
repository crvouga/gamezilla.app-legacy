import { isErr, RequestResponse, Result } from '~/@/core'
import { AppClientModule } from '~/app/@/architecture/app-client'
import { sendToServer, showErrSm } from '~/app/@/client'
import { FlowPuzzleId } from '../../puzzle/puzzle-id'
import { FlowPack } from '../pack'
import { ClientModule, initClient, type ModelClient, type MsgInCmdClient } from './types'

const updateFetchMissingPuzzles: ClientModule['update'] = (input) => {
  if (!input.ctx.pack) {
    return { model: input.model }
  }

  if (RequestResponse.isRequesting(input.model.request)) {
    return { model: input.model }
  }

  const isMissingPuzzles = input.ctx.pack.puzzleIds.some((puzzleId) => !input.model?.puzzles[puzzleId])

  if (!isMissingPuzzles) {
    return { model: input.model }
  }

  if (!input.msgCmd && !input.msgServer && !input.msgEvt && !input.msg) {
    return { model: input.model }
  }

  if (input.msgServer?.t === 'listed-puzzles-by-id') {
    return { model: input.model }
  }

  return {
    model: {
      ...input.model,
      request: RequestResponse.startedRequest(input.ctx.now)
    },
    msgCmd: [
      sendToServer({
        t: 'list-puzzles-by-id',
        puzzleIds: input.ctx.pack.puzzleIds,
        causedBy: { msgClient: input.msgServer, msgServer: input.msgServer, msgCmd: input.msgCmd, msgEvt: input.msgEvt }
      })
    ]
  }
}

const updateServerListedPuzzles: ClientModule['update'] = (input) => {
  const { model, msgServer } = input
  switch (msgServer?.t) {
    case 'listed-puzzles-by-id': {
      return AppClientModule.andThen(
        { model },
        (model) => {
          if (isErr(msgServer.listed)) {
            return {
              model,
              msgCmd: showErrSm(input.ctx.t('app.something-went-wrong'))
            }
          }

          const puzzlesNew = msgServer.listed.value.items.reduce((acc, puzzle) => {
            acc[puzzle.id] = puzzle
            return acc
          }, model.puzzles)

          return {
            model: {
              ...input.model,
              puzzles: puzzlesNew
            }
          }
        },
        (model) => {
          return {
            model: {
              ...model,
              request: RequestResponse.response(
                model.request,
                input.ctx.now,
                Result.mapOk(msgServer.listed, () => null)
              )
            }
          }
        }
      )
    }
  }
  return { model: input.model }
}

const updateRequest: ClientModule['update'] = (input) => {
  return {
    model: {
      ...input.model,
      request: RequestResponse.timePassed(input.model.request, input.ctx.now)
    }
  }
}

const updateFromCmd: ClientModule['update'] = (input) => {
  switch (input.msgCmd?.c.t) {
    case 'load': {
      return {
        model: {
          ...input.model,
          request: RequestResponse.startedRequest(input.ctx.now)
        },
        msgCmd: [
          sendToServer({
            t: 'list-puzzles-by-id',
            puzzleIds: input.msgCmd.c.pack.puzzleIds,
            causedBy: { msgCmd: input.msgCmd }
          })
        ]
      }
    }
    default: {
      return {
        model: input.model
      }
    }
  }
}

const subscriptionsRequest: ClientModule['subscriptions'] = (input) => {
  return RequestResponse.subscriptions(input.model.request, () => ({
    t: 'elapsed'
  }))
}

const update: ClientModule['update'] = (input) => {
  return AppClientModule.andThen(
    { model: input.model },
    (model) => updateServerListedPuzzles({ ...input, model }),
    (model) => updateFetchMissingPuzzles({ ...input, model }),
    (model) => updateRequest({ ...input, model }),
    (model) => updateFromCmd({ ...input, model })
  )
}

const subscriptions: ClientModule['subscriptions'] = (input) => {
  return subscriptionsRequest(input)
}

const load = (pack: FlowPack): MsgInCmdClient => {
  return {
    t: 'flow-pack-puzzles-grid',
    c: {
      t: 'load',
      pack
    }
  }
}

const isLoading = (model: ModelClient): boolean =>
  RequestResponse.isRequesting(model.request) || model.request.t === 'not-asked'

const shouldShowLoading = (model: ModelClient, puzzleIds: FlowPuzzleId[]): boolean => {
  return isLoading(model) && puzzleIds.every((puzzleId) => !(puzzleId in model.puzzles))
}

export const PackPuzzlesGridClient = {
  initClient,
  load,
  update,

  subscriptions,
  shouldShowLoading
}
