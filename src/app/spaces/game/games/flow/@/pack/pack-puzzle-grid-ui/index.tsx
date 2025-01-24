import { TranslatedText } from '~/@/l18n'
import type { VDom } from '~/@/vdom/vdom'
import { IconPlus, Swiper, Typography } from '~/app/@/ui'
import { PaginationDots } from '~/app/@/ui/pagination-dots'
import type { PuzzleId } from '../../puzzle/puzzle-id'

const COLUMN_COUNT = 5
const ROW_COUNT = 6
const PER_SLIDE_ITEM_COUNT = COLUMN_COUNT * ROW_COUNT

const View = (input: {
  id?: string
  slideIndex?: number
  onSlideIndexChanged?: (slideIndex: number) => void
  puzzleIds?: PuzzleId[]
  onClickPuzzleCell?: (input: { puzzleIndex: number; puzzleId: PuzzleId }) => void
  addCell?: {
    include: boolean
    onClick?: () => void
  }
}) => {
  const slides: VDom[] = []
  const puzzleIds = input.puzzleIds ?? []
  const cellCount = (puzzleIds.length ?? 0) + (input.addCell?.include ? 1 : 0)

  const slideCount = Math.ceil(cellCount / (COLUMN_COUNT * ROW_COUNT))

  for (let slideIndex = 0; slideIndex < slideCount; slideIndex++) {
    const startIndex = slideIndex * PER_SLIDE_ITEM_COUNT
    const startPosition = startIndex + 1
    const endPosition = startIndex + PER_SLIDE_ITEM_COUNT
    const endPositionPuzzle = Math.min(endPosition, puzzleIds.length)
    const slideTitle = `${startPosition} - ${endPositionPuzzle}`
    slides.push(
      <Swiper.Slide key={slideIndex} className='flex h-full w-3/4 flex-col items-center justify-center'>
        <div className='flex w-fit flex-col items-center justify-center gap-1'>
          <Typography
            text={TranslatedText.of(slideTitle)}
            className='flex w-full items-center justify-start p-1 text-2xl'
            role='heading'
          />

          <ViewPackPuzzleGridSlide
            key={slideIndex}
            slideIndex={slideIndex}
            puzzleIds={input.puzzleIds ?? []}
            renderCell={(inputCell) => {
              if (inputCell.index === puzzleIds.length && input.addCell?.include) {
                return <ViewAddCell onClick={input.addCell?.onClick} />
              }

              const { puzzleId } = inputCell

              if (!puzzleId) {
                return <ViewEmptyCell />
              }

              return (
                <ViewPuzzleCell
                  onClick={() => input.onClickPuzzleCell?.({ puzzleId, puzzleIndex: inputCell.index })}
                  index={inputCell.index}
                />
              )
            }}
          />
        </div>
      </Swiper.Slide>,
    )
  }

  return (
    <div className='flex h-full w-full flex-col gap-4 py-6'>
      <Swiper.Container
        onSlideIndexChanged={(slideIndex) => {
          console.log('slideIndex', slideIndex)
          input.onSlideIndexChanged?.(slideIndex)
        }}
        id={input.id ?? 'pack-puzzle-grid-swiper-container'}
        slideIndex={input.slideIndex ?? 0}
        className='flex h-full w-full items-center justify-center'
      >
        {slides}
      </Swiper.Container>
      <PaginationDots
        count={slideCount}
        activeIndex={input.slideIndex ?? 0}
        // onClick={input.onSlideIndexChanged}
      />
    </div>
  )
}

const ViewPackPuzzleGridSlide = (input: {
  slideIndex: number
  puzzleIds: PuzzleId[]
  renderCell: (input: { x: number; y: number; index: number; puzzleId: PuzzleId | null; empty: boolean }) => VDom
}) => {
  const columns: VDom[] = []
  const indexOffset = input.slideIndex * (COLUMN_COUNT * ROW_COUNT)

  for (let y = 0; y < ROW_COUNT; y++) {
    const row: VDom[] = []
    for (let x = 0; x < COLUMN_COUNT; x++) {
      const index = toIndex({ x, y }) + indexOffset
      const puzzleId = input.puzzleIds[index] ?? null
      const empty = index >= input.puzzleIds.length

      row.push(
        <div
          role='gridcell'
          key={`${y}-${x}`}
          className='flex aspect-square h-12 w-12 items-center justify-center overflow-hidden p-1 sm:h-16 sm:w-16'
        >
          {input.renderCell({ x, y, puzzleId, empty, index })}
        </div>,
      )
    }

    columns.push(
      <div key={y} className='flex w-full items-center justify-center'>
        {row}
      </div>,
    )
  }

  return (
    <div role='grid' className='aspect-square w-full'>
      {columns}
    </div>
  )
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
