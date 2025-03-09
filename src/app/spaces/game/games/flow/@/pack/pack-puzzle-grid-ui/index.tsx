import { TranslatedText } from '~/@/l18n'
import type { VDom } from '~/@/vdom/vdom'
import { IconPlus, Swiper, Typography } from '~/@/ui'
import { PaginationDots } from '~/@/ui/pagination-dots'
import type { PuzzleId } from '../../puzzle/puzzle-id'

const COLUMN_COUNT = 5
const ROW_COUNT = 6
const PER_SLIDE_ITEM_COUNT = COLUMN_COUNT * ROW_COUNT

const View = (input: {
  id?: string
  currentSlideIndex?: number
  onSlideIndexChanged?: (slideIndex: number) => void
  puzzleIds?: PuzzleId[]
  onClickPuzzleCell?: (input: { puzzleIndex: number; puzzleId: PuzzleId }) => void
  addCell?: {
    include: boolean
    onClick?: () => void
  }
}) => {
  const puzzleIds = input.puzzleIds ?? []
  const cellCount = (puzzleIds.length ?? 0) + (input.addCell?.include ? 1 : 0)
  const slideCount = Math.ceil(cellCount / (COLUMN_COUNT * ROW_COUNT))

  return (
    <div className='flex h-full w-full flex-col gap-4 py-6'>
      <Swiper.Container
        onSlideIndexChanged={(newSlideIndex) => input.onSlideIndexChanged?.(newSlideIndex)}
        id={input.id ?? 'pack-puzzle-grid-swiper-container'}
        slideIndex={input.currentSlideIndex ?? 0}
        className='flex h-full w-full items-center justify-center'
      >
        {Array.from({ length: slideCount }).map((_, slideIndex) => (
          <Swiper.Slide key={slideIndex} className='flex h-full w-3/4 flex-col items-center justify-center'>
            <ViewSlideContent
              puzzleIds={puzzleIds}
              slideIndex={slideIndex}
              onClickPuzzleCell={input.onClickPuzzleCell}
              addCell={input.addCell}
            />
          </Swiper.Slide>
        ))}
      </Swiper.Container>

      <PaginationDots count={slideCount} activeIndex={input.currentSlideIndex ?? 0} />
    </div>
  )
}

const ViewSlideContent = (input: {
  slideIndex: number
  puzzleIds: PuzzleId[]
  addCell?: {
    include: boolean
    onClick?: () => void
  }
  onClickPuzzleCell?: (input: { puzzleIndex: number; puzzleId: PuzzleId }) => void
}) => {
  return (
    <div className='flex w-fit flex-col items-center justify-center gap-1'>
      <ViewSlideHeading slideIndex={input.slideIndex} puzzleIds={input.puzzleIds} />

      <ViewGrid
        slideIndex={input.slideIndex}
        puzzleIds={input.puzzleIds ?? []}
        renderCell={(inputCell) => {
          const isAddCell = inputCell.index === input.puzzleIds.length && input.addCell?.include

          if (isAddCell) return <ViewAddCell onClick={input.addCell?.onClick} />

          const { puzzleId } = inputCell

          if (!puzzleId) return <ViewEmptyCell />

          return (
            <ViewPuzzleCell
              onClick={() => input.onClickPuzzleCell?.({ puzzleId, puzzleIndex: inputCell.index })}
              index={inputCell.index}
            />
          )
        }}
      />
    </div>
  )
}

const ViewSlideHeading = (input: { slideIndex: number; puzzleIds: PuzzleId[] }) => {
  const startIndex = input.slideIndex * PER_SLIDE_ITEM_COUNT
  const startPosition = startIndex + 1
  const endPosition = startIndex + PER_SLIDE_ITEM_COUNT
  const endPositionPuzzle = Math.min(endPosition, input.puzzleIds.length)
  const hasPuzzles = input.puzzleIds.length > 0

  if (!hasPuzzles) return null

  const slideTitle = `${startPosition} - ${endPositionPuzzle}`
  return (
    <Typography
      text={TranslatedText.of(slideTitle)}
      className='flex w-full items-center justify-start p-1 text-2xl'
      role='heading'
    />
  )
}

const ViewGrid = (input: {
  slideIndex: number
  puzzleIds: PuzzleId[]
  renderCell: (input: { x: number; y: number; index: number; puzzleId: PuzzleId | null; empty: boolean }) => VDom
}) => {
  const indexOffset = input.slideIndex * (COLUMN_COUNT * ROW_COUNT)

  return (
    <div role='grid' className='grid aspect-square w-full grid-cols-5 grid-rows-6'>
      {range2d({ x: COLUMN_COUNT, y: ROW_COUNT }).map(({ x, y }) => {
        const index = toIndex({ x, y }) + indexOffset
        const puzzleId = input.puzzleIds[index] ?? null
        const empty = index >= input.puzzleIds.length
        return (
          <div
            key={`${input.slideIndex}-${y}-${x}`}
            role='gridcell'
            className='flex aspect-square h-12 w-12 items-center justify-center overflow-hidden p-1 sm:h-16 sm:w-16'
          >
            {input.renderCell({ x, y, puzzleId, empty, index })}
          </div>
        )
      })}
    </div>
  )
}

const range2d = (input: { x: number; y: number }): { x: number; y: number }[] => {
  return Array.from({ length: input.y }).flatMap((_, y) => Array.from({ length: input.x }).map((_, x) => ({ x, y })))
}

const ViewAddCell = (input: { onClick?: () => void }) => {
  return (
    <button
      onClick={input.onClick}
      className='bg-paper clickable flex h-full w-full items-center justify-center overflow-hidden rounded border-2'
    >
      <IconPlus className='h-8 w-8' />
    </button>
  )
}

const ViewPuzzleCell = ({ onClick, index }: { onClick: () => void; index: number }) => {
  return (
    <button
      onClick={onClick}
      className='bg-paper clickable flex h-full w-full items-center justify-center overflow-hidden rounded text-lg font-normal'
    >
      {index + 1}
    </button>
  )
}

const ViewEmptyCell = () => {
  return <div className='flex h-full w-full items-center justify-center overflow-hidden rounded border-2 opacity-70' />
}

export const _ViewLoadingCell = () => {
  return (
    <div className='bg-paper flex h-full w-full animate-pulse items-center justify-center overflow-hidden rounded opacity-70' />
  )
}

export const _ViewErrorCell = ({ onClick, index }: { onClick: () => void; index: number }) => {
  return (
    <button
      onClick={onClick}
      className='clickable flex h-full w-full items-center justify-center overflow-hidden rounded bg-orange-500/50 text-xl font-bold'
    >
      {index + 1}
    </button>
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
