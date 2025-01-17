import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { VDom } from '~/@/vdom/vdom'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { EmptyState, IconPuzzlePiece, Spinner, Typography } from '~/app/@/ui'
import { FlowFrontendCmdRoot } from '../../frontend/cmd-root'
import { FlowFrontendCtxRoot } from '../../frontend/ctx-root'
import { VariantBoard } from '../../variant'
import type { Puzzle } from '../puzzle'
import { QueryPuzzlesInput } from '../puzzle-db/query'
import { PuzzleId } from '../puzzle-id'
import { QueryForm } from './query-form'
import type { FrontendModule, ModelFrontend, MsgFrontend, MsgInCmdFrontend } from './types'
import { Translator } from '~/@/l18n/generated'

const update: FrontendModule['update'] = (input) => {
  return AppFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
  )
}

const updateFromCmd: FrontendModule['update'] = (input) => {
  switch (input.msgCmd?.c.t) {
    case 'got-msg': {
      return updateFromMsg({ ...input, msg: input.msgCmd.c.msg })
    }
    default: {
      return { model: input.model }
    }
  }
}

const updateFromMsg: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'got-puzzle-db-puzzles': {
      return {
        model: {
          ...input.model,
          results: {
            ...input.model.results,
            [QueryPuzzlesInput.toKey(input.msg.query)]: input.msg.puzzles.map((p) => p.id),
          },
        },
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

const gotMsg = (msg: MsgFrontend): MsgInCmdFrontend => {
  return {
    t: 'puzzle-list',
    c: {
      t: 'got-msg',
      msg,
    },
  }
}

const watch = <TMsg,>(ctx: FlowFrontendCtxRoot, query: QueryPuzzlesInput, map: (m: MsgFrontend) => TMsg): Sub<TMsg> => {
  return Sub.map(ctx.puzzleDb.sub(query), (puzzles) => map({ t: 'got-puzzle-db-puzzles', query, puzzles }))
}

const View = (input: {
  ctx: FlowFrontendCtxRoot
  query: QueryPuzzlesInput
  model: ModelFrontend
  onQueryChanged: (query: QueryPuzzlesInput) => void
  onClick: (puzzle: Puzzle) => void
  fab?: VDom
}) => {
  const queryKey = QueryPuzzlesInput.toKey(input.query)
  const puzzleIds = input.model.results[queryKey] ?? []
  const puzzles = puzzleIds.flatMap((id) => (input.ctx.puzzles[id] ? [input.ctx.puzzles[id]] : []))

  const isLoading = !(queryKey in input.model.results)
  const isEmpty = !isLoading && puzzles.length === 0

  return (
    <div className='relative flex h-full w-full flex-col gap-2 overflow-hidden'>
      <QueryForm.View ctx={input.ctx} query={input.query} onChange={input.onQueryChanged} />

      <div className='relative flex w-full flex-1 flex-col items-center overflow-y-scroll'>
        {puzzles.map((puzzle) => (
          <ViewListItem key={puzzle.id} ctx={input.ctx} puzzle={puzzle} onClick={() => input.onClick(puzzle)} />
        ))}

        {isEmpty && (
          <EmptyState renderIcon={(input) => <IconPuzzlePiece {...input} />} label={input.ctx.t('flow.no-puzzles')} />
        )}

        {isLoading && (
          <div className='flex h-full w-full flex-col items-center'>
            <Spinner />
          </div>
        )}

        <div className='w-full py-24'></div>
      </div>

      {input.fab && <div className='absolute bottom-6 right-4 bg-black'>{input.fab}</div>}
    </div>
  )
}

const ViewListItem = (input: { ctx: { t: Translator; now: Posix }; puzzle: Puzzle; onClick: () => void }) => {
  return (
    <button
      key={input.puzzle.id}
      type='button'
      className='box-border flex w-full items-center text-left hover:bg-neutral-900 active:opacity-50'
      onClick={input.onClick}
    >
      <div className='flex aspect-square h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden'>
        <VariantBoard.View disabled model={input.puzzle.flow} />
      </div>
      <div className='overflow-hidden truncate px-4'>
        <p className='flex-nowrap overflow-hidden truncate text-ellipsis whitespace-nowrap text-base font-bold'>
          {input.puzzle.name}
        </p>
        <Typography
          variant='subtitle'
          text={TimeSpan.humanFriendlyString(Posix.diff(input.puzzle.createdAt, input.ctx.now), input.ctx.t)}
          className='text-secondary truncate text-xs'
        />
      </div>
    </button>
  )
}

export const PuzzleListFrontend = {
  update,
  watch,
  gotMsg,
  View,
}
