import { TranslatedText } from '~/@/l18n'
import { Box } from '~/@/vdom/primitives/box'
import { IconPlus } from '~/@/ui/icon'
import { Swiper } from '~/@/ui/swiper'
import { Typography } from '~/@/ui/typography'
import { Clickable, ClickablePaper } from '~/@/ui/clickable'
import { PaginationDots } from '~/@/ui/pagination-dots'
import { Paper } from '~/@/ui/paper'
import type { VDom } from '~/@/vdom/vdom'
import type { PuzzleId } from '../../puzzle/puzzle-id'
import { h } from '~/@/vdom/h'
import { Text } from '~/@/vdom/primitives/text'

const COLUMN_COUNT = 5
const ROW_COUNT = 6
const PER_SLIDE_ITEM_COUNT = COLUMN_COUNT * ROW_COUNT

const View = (input: {
  id?: string
  currentSlideIndex?: number
  onSlideIndexChanged?: (slideIndex: number) => void
  puzzleIds?: PuzzleId[]
  onPressPuzzleCell?: (input: { puzzleIndex: number; puzzleId: PuzzleId }) => void
  addCell?: {
    include: boolean
    onPress?: () => void
  }
}) => {
  const puzzleIds = input.puzzleIds ?? []
  const cellCount = (puzzleIds.length ?? 0) + (input.addCell?.include ? 1 : 0)
  const slideCount = Math.ceil(cellCount / (COLUMN_COUNT * ROW_COUNT))

  return h(Box, { class: 'flex h-full w-full flex-col gap-4 py-6' }, [
    h(
      Swiper.Container,
      {
        onSlideIndexChanged: (newSlideIndex: number) => input.onSlideIndexChanged?.(newSlideIndex),
        id: input.id ?? 'pack-puzzle-grid-swiper-container',
        slideIndex: input.currentSlideIndex ?? 0,
        class: 'flex flex-row h-full w-full items-center justify-center',
      },
      Array.from({ length: slideCount }).map((_, slideIndex) =>
        h(
          Swiper.Slide,
          {
            key: slideIndex,
            class: 'flex h-full w-3/4 flex-col items-center justify-center',
          },
          [
            h(ViewSlideContent, {
              puzzleIds,
              slideIndex,
              onPressPuzzleCell: input.onPressPuzzleCell,
              addCell: input.addCell,
            }),
          ],
        ),
      ),
    ),
    h(PaginationDots, { count: slideCount, activeIndex: input.currentSlideIndex ?? 0 }),
  ])
}

const ViewSlideContent = (input: {
  slideIndex: number
  puzzleIds: PuzzleId[]
  addCell?: {
    include: boolean
    onPress?: () => void
  }
  onPressPuzzleCell?: (input: { puzzleIndex: number; puzzleId: PuzzleId }) => void
}) => {
  return h(Box, { class: 'flex w-fit flex-col items-center justify-center gap-1' }, [
    h(ViewSlideHeading, { slideIndex: input.slideIndex, puzzleIds: input.puzzleIds }),
    h(ViewGrid, {
      slideIndex: input.slideIndex,
      puzzleIds: input.puzzleIds ?? [],
      renderCell: (inputCell: { x: number; y: number; index: number; puzzleId: PuzzleId | null; empty: boolean }) => {
        const isAddCell = inputCell.index === input.puzzleIds.length && input.addCell?.include

        if (isAddCell) return h(ViewAddCell, { onPress: input.addCell?.onPress })

        const { puzzleId } = inputCell

        if (!puzzleId) return h(ViewEmptyCell, {})

        return h(ViewPuzzleCell, {
          onPress: () => input.onPressPuzzleCell?.({ puzzleId, puzzleIndex: inputCell.index }),
          index: inputCell.index,
        })
      },
    }),
  ])
}

const ViewSlideHeading = (input: { slideIndex: number; puzzleIds: PuzzleId[] }) => {
  const startIndex = input.slideIndex * PER_SLIDE_ITEM_COUNT
  const startPosition = startIndex + 1
  const endPosition = startIndex + PER_SLIDE_ITEM_COUNT
  const endPositionPuzzle = Math.min(endPosition, input.puzzleIds.length)
  const hasPuzzles = input.puzzleIds.length > 0

  if (!hasPuzzles) return null

  return h(Typography, {
    text: TranslatedText.of(`${startPosition} - ${endPositionPuzzle}`),
    class: 'flex flex-row w-full items-center justify-start p-1 text-2xl',
    role: 'heading',
  })
}

const ViewGrid = (input: {
  slideIndex: number
  puzzleIds: PuzzleId[]
  renderCell: (input: { x: number; y: number; index: number; puzzleId: PuzzleId | null; empty: boolean }) => VDom
}) => {
  const indexOffset = input.slideIndex * (COLUMN_COUNT * ROW_COUNT)

  return h(
    Box,
    { role: 'grid', class: 'grid aspect-square w-full grid-cols-5 grid-rows-6' },
    range2d({ x: COLUMN_COUNT, y: ROW_COUNT }).map(({ x, y }) =>
      h(ViewGridCell, {
        key: `${x}-${y}`,
        x,
        y,
        indexOffset,
        puzzleIds: input.puzzleIds,
        renderCell: input.renderCell,
      }),
    ),
  )
}

const ViewGridCell = (input: {
  x: number
  y: number
  indexOffset: number
  puzzleIds: PuzzleId[]
  renderCell: (input: { x: number; y: number; index: number; puzzleId: PuzzleId | null; empty: boolean }) => VDom
}) => {
  const index = toIndex(input) + input.indexOffset
  const puzzleId = input.puzzleIds[index] ?? null
  const empty = index >= input.puzzleIds.length

  return h(
    Box,
    {
      role: 'gridcell',
      class: 'flex flex-row aspect-square h-12 w-12 items-center justify-center overflow-hidden p-1 sm:h-16 sm:w-16',
    },
    [
      input.renderCell({
        x: input.x,
        y: input.y,
        puzzleId,
        empty,
        index,
      }),
    ],
  )
}

const range2d = (input: { x: number; y: number }): { x: number; y: number }[] => {
  return range(input.y).flatMap((y) => range(input.x).map((x) => ({ x, y })))
}

const range = (length: number): number[] => {
  return Array.from({ length }, (_, i) => i)
}

const ViewAddCell = (input: { onPress?: () => void }) => {
  return h(
    ClickablePaper,
    {
      onPress: input.onPress,
      class: 'flex flex-row h-full w-full items-center justify-center overflow-hidden rounded border-2',
    },
    [h(IconPlus, { class: 'h-8 w-8' })],
  )
}

const ViewPuzzleCell = ({ onPress, index }: { onPress: () => void; index: number }) => {
  return h(
    ClickablePaper,
    {
      onPress: onPress,
      class: 'flex flex-row h-full w-full items-center justify-center overflow-hidden rounded text-lg font-normal',
    },
    [Text({ text: String(index + 1) })],
  )
}

const ViewEmptyCell = () => {
  return h(Box, {
    class: 'flex flex-row h-full w-full items-center justify-center overflow-hidden rounded border-2 opacity-70',
  })
}

export const _ViewLoadingCell = () => {
  return h(Paper, {
    class: 'flex flex-row h-full w-full animate-pulse items-center justify-center overflow-hidden rounded opacity-70',
  })
}

export const _ViewErrorCell = ({ onPress, index }: { onPress: () => void; index: number }) => {
  return h(
    Clickable,
    {
      onPress,
      class:
        'flex flex-row h-full w-full items-center justify-center overflow-hidden rounded bg-orange-500/50 text-xl font-bold',
    },
    [Text({ text: String(index + 1) })],
  )
}

const toIndex = ({ x, y }: { x: number; y: number }) => {
  return y * COLUMN_COUNT + x
}

const toSlideIndex = (puzzleIndex: number) => {
  return Math.floor(puzzleIndex / (COLUMN_COUNT * ROW_COUNT))
}

const clampSlideIndex = (input: { slideIndex: number; puzzleCount: number; isAddButtonIncluded: boolean }): number => {
  const itemCount = input.puzzleCount + (input.isAddButtonIncluded ? 1 : 0)
  const slideCount = Math.ceil(itemCount / PER_SLIDE_ITEM_COUNT)
  return Math.min(input.slideIndex, slideCount - 1)
}

export const PackPuzzleGridUI = {
  PER_SLIDE_ITEM_COUNT,
  ROW_COUNT,
  COLUMN_COUNT,
  clampSlideIndex,
  toIndex,
  toSlideIndex,
  View,
}
