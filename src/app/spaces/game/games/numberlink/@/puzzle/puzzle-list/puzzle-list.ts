import { TranslatedText } from '~/@/l18n'
import { Box } from '~/@/vdom/primitives/box'
import { Translator } from '~/@/l18n/generated'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { Checkbox, CheckboxState } from '~/@/ui/checkbox/checkbox'
import { Clickable, ClickableTransparent } from '~/@/ui/clickable'
import { EmptyState } from '~/@/ui/empty-state'
import { Gutter } from '~/@/ui/gutter'
import { IconPuzzlePiece } from '~/@/ui/icon'
import { Spinner } from '~/@/ui/spinner'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { FlowFrontendCtxBase } from '../../frontend/ctx-base'
import { NumberlinkVariantBoard } from '../../variant'
import { Puzzle } from '../puzzle'
import { PuzzleQuery } from '../puzzle-db/interface-query'
import { PuzzleId } from '../puzzle-id'
import { PuzzleListQueryForm } from './puzzle-list-query-form'
import { PuzzleDbQueryCache } from '../puzzle-db-query-cache'
import { ScrollBox } from '~/@/vdom/primitives/scroll-box'
import { IPlatform } from '~/@/platform/platform'

const View = (input: {
  selectable?: boolean
  selected?: PuzzleId[]
  ctx: FlowFrontendCtxBase
  query: PuzzleQuery
  onQueryChanged: (query: PuzzleQuery) => void
  onItemClick: (puzzle: Puzzle) => void
  onHeaderCheckboxClick?: (allPuzzleIds: PuzzleId[]) => void
}) => {
  const puzzles = PuzzleDbQueryCache.read(input.ctx, input.query)
  const isLoading = PuzzleDbQueryCache.isLoading(input.ctx, input.query)
  const isEmpty = PuzzleDbQueryCache.isEmpty(input.ctx, input.query)
  const totalCount = puzzles.length
  const selectedCount = Math.min(input.selected?.length ?? 0, totalCount)

  return h(Box, { class: 'relative flex w-full flex-1 flex-col overflow-hidden' }, [
    h(PuzzleListQueryForm.View, { ctx: input.ctx, query: input.query, onChange: input.onQueryChanged }),

    input.selectable &&
      h(
        Clickable,
        {
          class: 'flex flex-row w-fit items-center gap-4 px-4 py-2',
          onPress: () => input.onHeaderCheckboxClick?.(puzzles.map((p) => p.id)),
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

    h(
      ScrollBox,
      {
        class: 'relative flex w-full flex-1 flex-col',
        contentContainerStyle: {
          rowGap: 0,
        },
      },
      [
        ...puzzles.map((puzzle) =>
          h(ViewListItem, {
            selectable: input.selectable,
            query: input.query,
            key: puzzle.id,
            ctx: input.ctx,
            selected: input.selected?.some((id) => id === puzzle.id) ?? false,
            puzzle: puzzle,
            onPress: () => input.onItemClick(puzzle),
          }),
        ),

        isEmpty &&
          h(EmptyState, {
            renderIcon: (input) => h(IconPuzzlePiece, input),
            label: input.ctx.t('game.numberlink.no-puzzles'),
          }),

        isLoading && h(Spinner, {}),

        h(Gutter, { variant: 'screen' }),
      ],
    ),
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
  ctx: { t: Translator; now: UnixMs; platform: IPlatform }
  puzzle: Puzzle
  onPress?: () => void
  selected: boolean
}) => {
  return h(
    ClickableTransparent,
    {
      key: input.puzzle.id,
      class: 'box-border flex flex-row w-full items-center text-left',
      onPress: input.onPress,
    },
    [
      input.selectable && h(Box, { class: 'px-4' }, [h(Checkbox, { state: input.selected ? 'checked' : 'unchecked' })]),

      h(Box, { class: 'flex flex-row aspect-square h-24 w-24 shrink-0 items-center justify-center overflow-hidden' }, [
        h(NumberlinkVariantBoard.View, { disabled: true, model: input.puzzle.model, platform: input.ctx.platform }),
      ]),

      h(Box, { class: 'flex flex-col gap-1 truncate overflow-hidden px-4' }, [
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

export const PuzzleList = {
  View,
}
