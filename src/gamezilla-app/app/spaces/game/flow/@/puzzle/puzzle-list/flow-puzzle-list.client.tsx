import { AppClientModule } from 'gamezilla-app/app/@/architecture/app-client'
import { sendToServer, showErrSm } from 'gamezilla-app/app/@/client'
import { IconPuzzlePiece, Spinner, cn } from 'gamezilla-app/app/@/ui'
import { EmptyState } from 'gamezilla-app/app/@/ui/empty-state'
import { IntersectionObserverEmitter } from 'gamezilla-app/app/@/ui/intersection-observer'
import { Posix, RequestResponse, Result, TimeSpan, descend, isErr } from 'gamezilla-app/@/core'
import type { FlowPuzzle } from '../puzzle'
import type { ClientModule } from './flow-puzzle-list.types'
import { FlowVariantUI } from '../../flow/flow-variant'

const update: ClientModule['update'] = (input) => {
  return AppClientModule.andThen({ model: input.model }, (model) => updatePuzzleList({ ...input, model }))
}

const updatePuzzleList: ClientModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'flow-puzzle-list.user-observed-end-of-list': {
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

    case 'flow-puzzle-list.time-passed': {
      const requestNew = RequestResponse.timePassed(input.model.request, input.ctx.now)
      return {
        model: {
          ...input.model,
          request: requestNew
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

const View: ClientModule['View'] = (input) => {
  const { model, dispatch, ctx } = input

  const puzzles = Object.values(model.puzzles)
  const shouldShowLoadingState = model.request.t === 'not-asked' || model.request.t === 'loading'
  const shouldShowEmptyState = !shouldShowLoadingState && puzzles.length === 0

  return (
    <div className='relative flex h-full w-full flex-col gap-2 overflow-hidden'>
      <div className='border-1 relative flex w-full flex-1 flex-col items-center overflow-y-scroll border-t border-neutral-600'>
        {shouldShowEmptyState && (
          <EmptyState label={ctx.t('flow.no-puzzles')} renderIcon={(input) => <IconPuzzlePiece {...input} />} />
        )}

        {puzzles.sort(descend((puzzle) => Posix.toNumber(puzzle.lastUpdatedAt))).map((puzzle) => (
          <FlowPuzzleListItem
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

const FlowPuzzleListItem = ({ now, puzzle, onClick }: { now: Posix; puzzle: FlowPuzzle; onClick: () => void }) => {
  return (
    <button
      key={puzzle.id}
      type='button'
      className='box-border flex w-full items-center gap-4 border-b border-neutral-800 text-left hover:bg-neutral-900 active:opacity-50'
      onClick={onClick}
    >
      <div className='flex aspect-square h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden border-r border-neutral-600'>
        <FlowVariantUI.View disabled model={puzzle.flow} />
      </div>
      <div className='overflow-hidden'>
        <p className='flex-nowrap overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold'>{puzzle.name}</p>
        <p className='text-xs text-neutral-300'>{TimeSpan.humanFriendlyString(Posix.diff(puzzle.createdAt, now))}</p>
      </div>
    </button>
  )
}

export const FlowPuzzleListClient = {
  update,
  View
}
