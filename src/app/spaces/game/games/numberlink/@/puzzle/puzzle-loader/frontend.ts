import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { Checkbox, CheckboxState } from '~/@/ui/checkbox/checkbox'
import { Clickable, ClickableTransparent } from '~/@/ui/clickable'
import { EmptyState } from '~/@/ui/empty-state'
import { Gutter } from '~/@/ui/gutter'
import { IconPuzzlePiece } from '~/@/ui/icon'
import { SpinnerBlock } from '~/@/ui/spinner'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { AddPuzzlesCmd } from '../../frontend/add-puzzles-cmd.$msg'
import { FlowFrontendCtxBase } from '../../frontend/ctx-base'
import { NumberlinkVariantBoard } from '../../variant'
import { Puzzle } from '../puzzle'
import { PuzzleQuery } from '../puzzle-db/interface-query'
import { PuzzleId } from '../puzzle-id'
import { GotPuzzleLoaderMsg } from './got-puzzle-loader-msg.$msg'
import { QueryForm } from './query-form'
import type { FrontendModule, ModelFrontend, MsgFrontend } from './types'

const update: FrontendModule['update'] = (input) => {
  if (GotPuzzleLoaderMsg.is(input.msgIn)) {
    return update({
      ...input,
      msgIn: null,
      msg: input.msgIn.c.msg,
    })
  }

  switch (input.msg?.t) {
    case 'got-puzzle-db-puzzles': {
      return {
        model: {
          ...input.model,
          results: {
            ...input.model.results,
            [PuzzleQuery.toKey(input.msg.query)]: input.msg.puzzles.map((p) => p.id),
          },
        },
        msgOut: [
          AddPuzzlesCmd.init(
            input.msg.puzzles.reduce<{ [k: PuzzleId]: Puzzle }>((acc, p) => ({ ...acc, [p.id]: p }), {}),
            input.msg,
          ),
        ],
      }
    }
  }

  return { model: input.model }
}

const watch = <TMsg>(ctx: FlowFrontendCtxBase, query: PuzzleQuery | null, map: (m: MsgFrontend) => TMsg): Sub<TMsg> => {
  if (!query) {
    return Sub.none()
  }
  return Sub.map(ctx.puzzleDb.sub(query), (puzzles) => map({ t: 'got-puzzle-db-puzzles', query, puzzles }))
}

const ViewList = (input: {
  selectable?: boolean
  selected?: PuzzleId[]
  ctx: FlowFrontendCtxBase
  query: PuzzleQuery
  model: ModelFrontend
  onQueryChanged: (query: PuzzleQuery) => void
  onItemClick: (puzzle: Puzzle) => void
  onHeaderCheckboxClick?: (allPuzzleIds: PuzzleId[]) => void
}) => {
  const queryKey = PuzzleQuery.toKey(input.query)
  const puzzleIds = input.model.results[queryKey] ?? []
  const puzzles = puzzleIds.flatMap((id) => (input.ctx.puzzles[id] ? [input.ctx.puzzles[id]] : []))

  const isLoading = !(queryKey in input.model.results)
  const isEmpty = !isLoading && puzzles.length === 0

  const totalCount = puzzles.length
  const selectedCount = Math.min(input.selected?.length ?? 0, totalCount)

  return h('div', { class: 'relative flex w-full flex-1 flex-col overflow-hidden' }, [
    h(QueryForm.View, { ctx: input.ctx, query: input.query, onChange: input.onQueryChanged }),

    input.selectable &&
      h(
        Clickable,
        {
          class: 'flex w-fit items-center gap-4 px-4 py-2',
          onClick: () => input.onHeaderCheckboxClick?.(puzzleIds),
        },
        [
          h(Checkbox, { state: toTopLevelCheckboxState({ totalCount, selectedCount }) }),
          h(Typography, {
            variant: 'body',
            color: 'text-secondary',
            class: 'text-lg',
            text: input.ctx.t('game.numberlink.puzzles-selected', {
              totalCount: puzzles.length,
              selectedCount: input.selected?.length ?? 0,
            }),
          }),
        ],
      ),

    h('div', { class: 'relative flex w-full flex-1 flex-col items-center overflow-y-scroll' }, [
      ...puzzles.map((puzzle) =>
        h(ViewListItem, {
          selectable: input.selectable,
          query: input.query,
          key: puzzle.id,
          ctx: input.ctx,
          selected: input.selected?.some((id) => id === puzzle.id) ?? false,
          puzzle: puzzle,
          onClick: () => input.onItemClick(puzzle),
        }),
      ),

      isEmpty &&
        h(EmptyState, {
          renderIcon: (input) => h(IconPuzzlePiece, input),
          label: input.ctx.t('game.numberlink.no-puzzles'),
        }),

      isLoading && h(SpinnerBlock, {}),

      h(Gutter, { variant: 'screen' }),
    ]),
  ])
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
  query: PuzzleQuery
  ctx: { t: Translator; now: UnixMs }
  puzzle: Puzzle
  onClick?: () => void
  selected: boolean
}) => {
  return h(
    ClickableTransparent,
    {
      key: input.puzzle.id,
      class: 'box-border flex w-full items-center text-left',
      onClick: input.onClick,
    },
    [
      input.selectable &&
        h('div', { class: 'px-4' }, [h(Checkbox, { state: input.selected ? 'checked' : 'unchecked' })]),

      h('div', { class: 'flex aspect-square h-24 w-24 shrink-0 items-center justify-center overflow-hidden' }, [
        h(NumberlinkVariantBoard.View, { disabled: true, model: input.puzzle.model }),
      ]),

      h('div', { class: 'flex flex-col gap-1 truncate overflow-hidden px-4' }, [
        h(Typography, {
          variant: 'body',
          color: 'text-primary',
          text: TranslatedText.of(input.puzzle.name),
          class: 'truncate',
        }),

        h(Typography, {
          variant: 'subtitle',
          color: 'text-secondary',
          text: toListItemSecondaryText(input),
          class: 'truncate text-xs',
        }),
      ]),
    ],
  )
}

const toListItemSecondaryText = (input: {
  ctx: { t: Translator; now: UnixMs }
  puzzle: Puzzle
  query: PuzzleQuery
}): TranslatedText => {
  const orderField = PuzzleQuery.toOrderField(input.query)
  switch (orderField) {
    case 'createdAt':
    default: {
      return input.ctx.t(
        'app.created-at',
        TimeSpan.humanFriendlyString(UnixMs.diff(input.puzzle.createdAt, input.ctx.now), input.ctx.t),
      )
    }
    case 'lastUpdatedAt': {
      return input.ctx.t(
        'app.last-updated-at',
        TimeSpan.humanFriendlyString(UnixMs.diff(input.puzzle.lastUpdatedAt, input.ctx.now), input.ctx.t),
      )
    }
  }
}

export const PuzzleLoaderFrontend = {
  update,
  watch,
  ViewList,
}
