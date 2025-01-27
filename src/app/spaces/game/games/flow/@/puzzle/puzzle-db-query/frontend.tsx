import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { VDom } from '~/@/vdom/vdom'
import { EmptyState, IconPuzzlePiece, SpinnerBlock, Typography } from '~/@/ui'
import { Checkbox, CheckboxState } from '~/@/ui/checkbox/checkbox'
import { Gutter } from '~/@/ui/gutter'
import { FlowFrontendCmdRoot } from '../../frontend/cmd-root'
import { FlowFrontendCtxRoot } from '../../frontend/ctx-root'
import { VariantBoard } from '../../variant'
import { Puzzle } from '../puzzle'
import { PuzzleDbQuery } from '../puzzle-db/query'
import { PuzzleId } from '../puzzle-id'
import { QueryForm } from './query-form'
import type { FrontendModule, ModelFrontend, MsgFrontend, MsgInCmdFrontend } from './types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgCmd?.c.t) {
    case 'got-msg': {
      return update({
        ...input,
        msgCmd: null,
        msg: input.msgCmd.c.msg,
      })
    }
  }

  switch (input.msg?.t) {
    case 'got-puzzle-db-puzzles': {
      return {
        model: {
          ...input.model,
          results: {
            ...input.model.results,
            [PuzzleDbQuery.toKey(input.msg.query)]: input.msg.puzzles.map((p) => p.id),
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
  }

  return { model: input.model }
}

const gotMsg = (msg: MsgFrontend): MsgInCmdFrontend => {
  return {
    t: 'puzzle-db-query',
    c: {
      t: 'got-msg',
      msg,
    },
  }
}

const watch = <TMsg,>(
  ctx: FlowFrontendCtxRoot,
  query: PuzzleDbQuery | null,
  map: (m: MsgFrontend) => TMsg,
): Sub<TMsg> => {
  if (!query) {
    return Sub.None
  }
  return Sub.map(ctx.puzzleDb.sub(query), (puzzles) => map({ t: 'got-puzzle-db-puzzles', query, puzzles }))
}

const ViewList = (input: {
  selectable?: boolean
  selected?: PuzzleId[]
  ctx: FlowFrontendCtxRoot
  query: PuzzleDbQuery
  model: ModelFrontend
  onQueryChanged: (query: PuzzleDbQuery) => void
  onItemClick: (puzzle: Puzzle) => void
  onHeaderCheckboxClick?: (allPuzzleIds: PuzzleId[]) => void
  fab?: VDom
}) => {
  const queryKey = PuzzleDbQuery.toKey(input.query)
  const puzzleIds = input.model.results[queryKey] ?? []
  const puzzles = puzzleIds.flatMap((id) => (input.ctx.puzzles[id] ? [input.ctx.puzzles[id]] : []))

  const isLoading = !(queryKey in input.model.results)
  const isEmpty = !isLoading && puzzles.length === 0

  const totalCount = puzzles.length
  const selectedCount = Math.min(input.selected?.length ?? 0, totalCount)

  return (
    <div className='relative flex w-full flex-1 flex-col overflow-hidden'>
      <QueryForm.View ctx={input.ctx} query={input.query} onChange={input.onQueryChanged} />

      {input.selectable && (
        <button
          className='clickable flex w-fit items-center gap-4 px-4 py-2'
          type='button'
          onClick={() => input.onHeaderCheckboxClick?.(puzzleIds)}
        >
          <Checkbox state={toTopLevelCheckboxState({ totalCount, selectedCount })} />
          <Typography
            variant='body'
            color='text-secondary'
            className='text-lg'
            text={input.ctx.t('flow.puzzles-selected', {
              totalCount: puzzles.length,
              selectedCount: input.selected?.length ?? 0,
            })}
          />
        </button>
      )}

      <div className='relative flex w-full flex-1 flex-col items-center overflow-y-scroll'>
        {puzzles.map((puzzle) => (
          <ViewListItem
            selectable={input.selectable}
            query={input.query}
            key={puzzle.id}
            ctx={input.ctx}
            selected={input.selected?.some((id) => id === puzzle.id) ?? false}
            puzzle={puzzle}
            onClick={() => input.onItemClick(puzzle)}
          />
        ))}

        {isEmpty && (
          <EmptyState renderIcon={(input) => <IconPuzzlePiece {...input} />} label={input.ctx.t('flow.no-puzzles')} />
        )}

        {isLoading && <SpinnerBlock />}

        <Gutter variant='screen' />
      </div>

      {input.fab && <div className='absolute bottom-6 right-4 bg-black'>{input.fab}</div>}
    </div>
  )
}

const toTopLevelCheckboxState = (input: { totalCount: number; selectedCount: number }): CheckboxState => {
  if (input.selectedCount === 0) {
    return 'unchecked'
  }
  if (input.selectedCount === input.totalCount) {
    return 'checked'
  }
  return 'indeterminate'
}

const ViewListItem = (input: {
  selectable?: boolean
  query: PuzzleDbQuery
  ctx: { t: Translator; now: Posix }
  puzzle: Puzzle
  onClick?: () => void
  selected: boolean
}) => {
  return (
    <button
      key={input.puzzle.id}
      type='button'
      className='clickable box-border flex w-full items-center text-left'
      onClick={input.onClick}
    >
      {input.selectable && (
        <div className='px-4'>
          <Checkbox state={input.selected ? 'checked' : 'unchecked'} />
        </div>
      )}

      <div className='flex aspect-square h-24 w-24 shrink-0 items-center justify-center overflow-hidden'>
        <VariantBoard.View disabled model={input.puzzle.flow} />
      </div>

      <div className='flex flex-col gap-1 overflow-hidden truncate px-4'>
        <Typography
          variant='body'
          color='text-primary'
          text={TranslatedText.of(input.puzzle.name)}
          className='truncate'
        />

        <Typography
          variant='subtitle'
          color='text-secondary'
          text={toListItemSecondaryText(input)}
          className='truncate text-xs'
        />
      </div>
    </button>
  )
}

const toListItemSecondaryText = (input: {
  ctx: { t: Translator; now: Posix }
  puzzle: Puzzle
  query: PuzzleDbQuery
}): TranslatedText => {
  const orderField = PuzzleDbQuery.toOrderField(input.query)
  switch (orderField) {
    case 'createdAt':
    default: {
      return input.ctx.t(
        'app.created-at',
        TimeSpan.humanFriendlyString(Posix.diff(input.puzzle.createdAt, input.ctx.now), input.ctx.t),
      )
    }
    case 'lastUpdatedAt': {
      return input.ctx.t(
        'app.last-updated-at',
        TimeSpan.humanFriendlyString(Posix.diff(input.puzzle.lastUpdatedAt, input.ctx.now), input.ctx.t),
      )
    }
  }
}

export const PuzzleDbQueryFrontend = {
  update,
  watch,
  gotMsg,
  ViewList,
}
