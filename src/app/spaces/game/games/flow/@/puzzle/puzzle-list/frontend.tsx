import { descend } from '~/@/array/sorting'
import { RequestResponse } from '~/@/request-response/request-response'
import { Result, isErr, isOk } from '~/@/result'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { sendToBackend, showErrSm } from '~/app/@/frontend/cmd'
import { IconPuzzlePiece } from '~/app/@/ui'
import { EmptyState } from '~/app/@/ui/empty-state'
import { IntersectionObserverEmitter } from '~/app/@/ui/intersection-observer'
import { FlowFrontendCmdRoot } from '../../frontend/cmd-root'
import { Solutions } from '../../solutions/solutions'
import { VariantBoard } from '../../variant'
import type { Puzzle } from '../puzzle'
import { QueryPuzzlesInput } from '../puzzle-db/query'
import { PuzzleId } from '../puzzle-id'
import type { FrontendModule, ModelFrontend, MsgFrontend, MsgInCmdFrontend, MsgToBackend } from './types'

const update: FrontendModule['update'] = (input) => {
  return AppFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromCmd({ ...input, model }),
    (model) => updateFromBackend({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
  )
}

const updateFromCmd: FrontendModule['update'] = (input) => {
  switch (input.msgCmd?.c.t) {
    case 'load': {
      return {
        model: {
          ...input.model,
          request: RequestResponse.startedRequest(input.ctx.now),
        },
        msgCmd: [
          sendToBackend({
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

const updateFromMsg: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'time-passed': {
      return {
        model: {
          ...input.model,
          request: RequestResponse.timePassed(input.model.request, input.ctx.now),
        },
      }
    }
    case 'got-puzzle-db-puzzles': {
      return {
        model: input.model,
        msgCmd: [
          FlowFrontendCmdRoot.addPuzzles(
            input.msg.puzzles.reduce<{ [k: PuzzleId]: Puzzle }>((acc, p) => ({ ...acc, [p.id]: p }), {}),
            input.msg,
          ),
        ],
      }
    }
    default: {
      return { model: input.model }
    }
  }
}

const updateFromBackend: FrontendModule['update'] = (input) => {
  switch (input.msgBackend?.t) {
    case 'listed-puzzle': {
      const puzzles = isOk(input.msgBackend.listed) ? input.msgBackend.listed.value.puzzles.items : []
      const byId = puzzles.reduce<{ [k: PuzzleId]: Puzzle }>((acc, p) => ({ ...acc, [p.id]: p }), {})
      const solutions = isOk(input.msgBackend.listed) ? input.msgBackend.listed.value.solutions : Solutions.init

      return {
        model: {
          ...input.model,
          request: RequestResponse.response(
            input.model.request,
            input.ctx.now,
            Result.mapOk(input.msgBackend.listed, () => null),
          ),
        },
        msgCmd: [
          FlowFrontendCmdRoot.addPuzzles(byId, input.msgBackend),
          FlowFrontendCmdRoot.addSolutions(solutions, input.msgBackend),
          ...(isErr(input.msgBackend.listed)
            ? showErrSm<{ MsgFrontend: MsgFrontend; MsgToBackend: MsgToBackend }>(
                input.ctx.t('app.something-went-wrong'),
              )
            : []),
        ],
      }
    }
    default: {
      return { model: input.model }
    }
  }
}

const load = (): MsgInCmdFrontend => {
  return {
    t: 'puzzle-list',
    c: {
      t: 'load',
    },
  }
}

const didLoad = <TCmd,>(output: { msgCmd?: (MsgInCmdFrontend | TCmd)[] }): boolean => {
  return (
    output.msgCmd?.some(
      (cmd) => typeof cmd === 'object' && cmd && 't' in cmd && cmd.t === 'puzzle-list' && cmd.c.t === 'load',
    ) ?? false
  )
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  const queryInput: QueryPuzzlesInput = {
    where: {
      createdBy: {
        equals: input.ctx.space.hostId,
      },
    },
    order: {
      createdAt: 'desc',
    },
    pagination: {
      limit: 25,
      offset: 0,
    },
  }

  return Sub.map(input.ctx.puzzleDb.sub(queryInput), (puzzles) => ({
    t: 'got-puzzle-db-puzzles',
    input: queryInput,
    puzzles,
  }))
}

const View: FrontendModule['View'] = (input) => {
  const puzzles = Object.values(input.ctx.puzzles)
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

const isLoading = (model: ModelFrontend): boolean => {
  return model.request.t === 'loading'
}

export const PuzzleListFrontend = {
  update,
  View,
  didLoad,
  load,
  isLoading,
  subscriptions,
}
