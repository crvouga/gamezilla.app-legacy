import { AppClientModule } from '~/app/@/architecture/app-client'
import { sendToServer, showErrSm } from '~/app/@/client'
import { IconPuzzlePiece, Spinner, cn } from '~/app/@/ui'
import { EmptyState } from '~/app/@/ui/empty-state'
import { IntersectionObserverEmitter } from '~/app/@/ui/intersection-observer'
import { Posix, RequestResponse, Result, TimeSpan, isErr } from '~/@/core'
import type { Puzzle } from '../puzzle'
import type { ClientModule, MsgInCmdClient } from './types'
import { FlowVariantUI } from '../../flow/flow-variant'
import { descend } from '~/@/array/sorting'

const update: ClientModule['update'] = (input) => {
  return AppClientModule.andThen({ model: input.model }, (model) => updatePuzzleList({ ...input, model }))
}

const updatePuzzleList: ClientModule['update'] = (input) => {
  switch (input.msgCmd?.c.t) {
    case 'load': {
      return {
        model: {
          ...input.model,
          request: RequestResponse.startedRequest(input.ctx.now)
        },
        msgCmd: [
          sendToServer({
            t: 'flow-puzzle-list.list-puzzles',
            input: {
              order: {
                lastUpdatedAt: 'desc'
              },
              pagination: {
                limit: 25,
                offset: 0
              },
              where: {
                createdBy: {
                  equals: input.ctx.space.hostId
                }
              }
            }
          })
        ]
      }
    }
  }

  switch (input.msg?.t) {
    case 'flow-puzzle-list.time-passed': {
      return {
        model: {
          ...input.model,
          request: RequestResponse.timePassed(input.model.request, input.ctx.now)
        }
      }
    }
  }

  switch (input.msgServer?.t) {
    case 'flow-puzzle-list.listed-puzzle': {
      const puzzles = input.msgServer.listed.t === 'ok' ? input.msgServer.listed.value.items : []

      const puzzlesNew = {
        ...input.model.puzzles
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
            Result.mapOk(input.msgServer.listed, () => null)
          ),
          puzzles: puzzlesNew
        },
        msgCmd: isErr(input.msgServer.listed) ? showErrSm(input.ctx.t('app.something-went-wrong')) : []
      }
    }
    default: {
      break
    }
  }

  return { model: input.model }
}

const load = (): MsgInCmdClient => {
  return {
    t: 'flow-puzzle-list',
    c: {
      t: 'load'
    }
  }
}

const didLoad = <TCmd,>(output: { msgCmd?: (MsgInCmdClient | TCmd)[] }): boolean => {
  return (
    output.msgCmd?.some(
      (cmd) => typeof cmd === 'object' && cmd && 't' in cmd && cmd.t === 'flow-puzzle-list' && cmd.c.t === 'load'
    ) ?? false
  )
}

const View: ClientModule['View'] = (input) => {
  const { model, dispatch, ctx } = input

  const puzzles = Object.values(model.puzzles)
  const shouldShowLoadingState = model.request.t === 'not-asked' || model.request.t === 'loading'
  const shouldShowEmptyState = !shouldShowLoadingState && puzzles.length === 0

  return (
    <div className='relative flex h-full w-full flex-col gap-2 overflow-hidden'>
      <div className='border-1 relative flex w-full flex-1 flex-col items-center overflow-y-scroll border-t '>
        {shouldShowEmptyState && (
          <EmptyState label={ctx.t('flow.no-puzzles')} renderIcon={(input) => <IconPuzzlePiece {...input} />} />
        )}

        {puzzles.sort(descend((puzzle) => Posix.toNumber(puzzle.lastUpdatedAt))).map((puzzle) => (
          <PuzzleListItem
            now={ctx.now}
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
          onVisible={() =>
            dispatch({
              t: 'flow-puzzle-list.user-observed-end-of-list'
            })
          }
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
      className='box-border flex w-full items-center gap-4 border-b  text-left hover:bg-neutral-900 active:opacity-50'
      onClick={onClick}
    >
      <div className='flex aspect-square h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden border-r '>
        <FlowVariantUI.View disabled model={puzzle.flow} />
      </div>
      <div className='overflow-hidden'>
        <p className='flex-nowrap overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold'>{puzzle.name}</p>
        <p className='text-secondary text-xs'>{TimeSpan.humanFriendlyString(Posix.diff(puzzle.createdAt, now))}</p>
      </div>
    </button>
  )
}

export const PuzzleListClient = {
  update,
  View,
  didLoad,
  load
}
