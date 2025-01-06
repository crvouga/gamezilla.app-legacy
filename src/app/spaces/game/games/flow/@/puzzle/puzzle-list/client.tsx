import { descend } from '~/@/array/sorting'
import { RequestResponse } from '~/@/request-response/request-response'
import { Result, isErr } from '~/@/result'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { AppClientModule } from '~/app/@/architecture/app-client'
import { sendToServer, showErrSm } from '~/app/@/client/cmd'
import { IconPuzzlePiece, Spinner, cn } from '~/app/@/ui'
import { EmptyState } from '~/app/@/ui/empty-state'
import { IntersectionObserverEmitter } from '~/app/@/ui/intersection-observer'
import { VariantBoard } from '../../variant'
import type { Puzzle } from '../puzzle'
import type { ClientModule, ModelClient, MsgInCmdClient } from './types'

const update: ClientModule['update'] = (input) => {
  return AppClientModule.andThen(
    { model: input.model },
    (model) => updateFromCmd({ ...input, model }),
    (model) => updateFromServer({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
  )
}

const updateFromCmd: ClientModule['update'] = (input) => {
  switch (input.msgCmd?.c.t) {
    case 'load': {
      return {
        model: {
          ...input.model,
          request: RequestResponse.startedRequest(input.ctx.now),
        },
        msgCmd: [
          sendToServer({
            t: 'list-puzzles',
            input: {
              order: {
                lastUpdatedAt: 'desc',
              },
              pagination: {
                limit: 25,
                offset: 0,
              },
              where: {
                createdBy: {
                  equals: input.ctx.space.hostId,
                },
              },
            },
          }),
        ],
      }
    }
    default: {
      return { model: input.model }
    }
  }
}

const updateFromMsg: ClientModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'time-passed': {
      return {
        model: {
          ...input.model,
          request: RequestResponse.timePassed(input.model.request, input.ctx.now),
        },
      }
    }
    default: {
      return { model: input.model }
    }
  }
}

const updateFromServer: ClientModule['update'] = (input) => {
  switch (input.msgServer?.t) {
    case 'listed-puzzle': {
      const puzzles = input.msgServer.listed.t === 'ok' ? input.msgServer.listed.value.items : []

      const puzzlesNew = {
        ...input.model.puzzles,
      }
      for (const puzzle of puzzles) {
        puzzlesNew[puzzle.id] = puzzle
      }

      return {
        model: {
          ...input.model,
          request: RequestResponse.response(
            input.model.request,
            input.ctx.now,
            Result.mapOk(input.msgServer.listed, () => null),
          ),
          puzzles: puzzlesNew,
        },
        msgCmd: isErr(input.msgServer.listed) ? showErrSm(input.ctx.t('app.something-went-wrong')) : [],
      }
    }
    default: {
      return { model: input.model }
    }
  }
}

const load = (): MsgInCmdClient => {
  return {
    t: 'flow-cmd.puzzle-list',
    c: {
      t: 'load',
    },
  }
}

const didLoad = <TCmd,>(output: { msgCmd?: (MsgInCmdClient | TCmd)[] }): boolean => {
  return (
    output.msgCmd?.some(
      (cmd) => typeof cmd === 'object' && cmd && 't' in cmd && cmd.t === 'flow-cmd.puzzle-list' && cmd.c.t === 'load',
    ) ?? false
  )
}

const View: ClientModule['View'] = (input) => {
  const puzzles = Object.values(input.model.puzzles)
  const shouldShowLoadingState = input.model.request.t === 'not-asked' || input.model.request.t === 'loading'
  const shouldShowEmptyState = !shouldShowLoadingState && puzzles.length === 0

  return (
    <div className='relative flex h-full w-full flex-col gap-2 overflow-hidden'>
      <div className='border-1 relative flex w-full flex-1 flex-col items-center overflow-y-scroll'>
        {shouldShowEmptyState && (
          <EmptyState label={input.ctx.t('flow.no-puzzles')} renderIcon={(input) => <IconPuzzlePiece {...input} />} />
        )}

        {puzzles.sort(descend((puzzle) => Posix.toNumber(puzzle.lastUpdatedAt))).map((puzzle) => (
          <PuzzleListItem
            now={input.ctx.now}
            key={puzzle.id}
            puzzle={puzzle}
            onClick={() => input.emits?.clickedPuzzleItem(puzzle)}
          />
        ))}

        <div
          className={cn('flex h-32 w-full items-center justify-center py-6', !shouldShowLoadingState && 'opacity-0')}
        >
          <Spinner />
        </div>

        <IntersectionObserverEmitter
          id='puzzle-builder-list'
          onVisible={() => input.dispatch({ t: 'user-observed-end-of-list' })}
        />
      </div>

      <div className='absolute bottom-6 right-4 bg-black'>{input.slots?.fab(null)}</div>
    </div>
  )
}

const PuzzleListItem = ({ now, puzzle, onClick }: { now: Posix; puzzle: Puzzle; onClick: () => void }) => {
  return (
    <button
      key={puzzle.id}
      type='button'
      className='box-border flex w-full items-center text-left hover:bg-neutral-900 active:opacity-50'
      onClick={onClick}
    >
      <div className='flex aspect-square h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden'>
        <VariantBoard.View disabled model={puzzle.flow} />
      </div>
      <div className='overflow-hidden truncate px-4'>
        <p className='flex-nowrap overflow-hidden truncate text-ellipsis whitespace-nowrap text-base font-bold'>
          {puzzle.name}
        </p>
        <p className='text-secondary truncate text-xs'>
          {TimeSpan.humanFriendlyString(Posix.diff(puzzle.createdAt, now))}
        </p>
      </div>
    </button>
  )
}

const isLoading = (model: ModelClient): boolean => {
  return model.request.t === 'loading'
}

export const PuzzleListClient = {
  update,
  View,
  didLoad,
  load,
  isLoading,
}
