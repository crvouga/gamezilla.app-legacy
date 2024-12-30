import type { VDom } from '~/@/vdom/vdom'
import { IconPlus, Swiper } from '~/app/@/ui'
import type { PuzzleId } from '../../puzzle/puzzle-id'

const COLUMN_COUNT = 5
const ROW_COUNT = 6
const PER_SLIDE_ITEM_COUNT = COLUMN_COUNT * ROW_COUNT

const toIndex = ({ x, y }: { x: number; y: number }) => {
  return y * COLUMN_COUNT + x
}

const toSlideIndex = (index: number) => {
  return Math.floor(index / (COLUMN_COUNT * ROW_COUNT))
}

const clampSlideIndex = (slideIndex: number, itemCount: number): number => {
  const slideCount = Math.ceil(itemCount / PER_SLIDE_ITEM_COUNT)
  return Math.min(slideIndex, slideCount - 1)
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
      const index =
        toIndex({
          x,
          y
        }) + indexOffset
      const puzzleId = input.puzzleIds[index] ?? null
      const empty = index >= input.puzzleIds.length

      row.push(
        <div
          role='gridcell'
          key={`${y}-${x}`}
          className='flex aspect-square h-12 w-12 items-center justify-center overflow-hidden p-1 sm:h-16 sm:w-16'
        >
          {input.renderCell({
            x,
            y,
            puzzleId,
            empty,
            index
          })}
        </div>
      )
    }

    columns.push(
      <div key={y} className='flex w-full items-center justify-center'>
        {row}
      </div>
    )
  }

  return (
    <div role='grid' className='aspect-square w-full'>
      {columns}
    </div>
  )
}

const View = (input: {
  id: string
  slideIndex: number
  onSlideIndexChanged: (index: number) => void
  puzzleIds: PuzzleId[]
  renderCell: (input: { x: number; y: number; empty: boolean; puzzleId: PuzzleId | null; index: number }) => VDom
}) => {
  const slides: VDom[] = []

  const slideCount = Math.ceil((input.puzzleIds.length + 1) / (COLUMN_COUNT * ROW_COUNT))

  for (let slideIndex = 0; slideIndex < slideCount; slideIndex++) {
    slides.push(
      <Swiper.Slide key={slideIndex} className='flex h-full w-3/4 flex-col items-center justify-center'>
        <ViewPackPuzzleGridSlide
          key={slideIndex}
          slideIndex={slideIndex}
          puzzleIds={input.puzzleIds}
          renderCell={input.renderCell}
        />
      </Swiper.Slide>
    )
  }

  return (
    <Swiper.Container
      onSlideIndexChanged={input.onSlideIndexChanged}
      id={input.id}
      slideIndex={input.slideIndex}
      className='flex h-full w-full items-center justify-center'
    >
      {slides}
    </Swiper.Container>
  )
}

const ViewAddCell = (input: { onClick: () => void }) => {
  return (
    <button
      onClick={input.onClick}
      className='bg-paper flex h-full w-full items-center justify-center overflow-hidden rounded border-2 hover:opacity-90 active:opacity-80'
    >
      <IconPlus className='h-8 w-8' />
    </button>
  )
}

const ViewPuzzleCell = ({ onClick, index }: { onClick: () => void; index: number }) => {
  return (
    <button
      onClick={onClick}
      className='bg-paper flex h-full w-full items-center justify-center overflow-hidden rounded text-xl font-bold hover:opacity-90 active:opacity-80'
    >
      {index + 1}
    </button>
  )
}

const ViewEmptyCell = () => {
  return <div className='flex h-full w-full items-center justify-center overflow-hidden rounded border-2 opacity-70' />
}

const ViewLoadingCell = () => {
  return (
    <div className='bg-paper flex h-full w-full animate-pulse items-center justify-center overflow-hidden rounded opacity-70' />
  )
}

const ViewErrorCell = ({ onClick, index }: { onClick: () => void; index: number }) => {
  return (
    <button
      onClick={onClick}
      className='flex h-full w-full items-center justify-center overflow-hidden rounded bg-orange-500/50 text-xl font-bold hover:opacity-90 active:opacity-80'
    >
      {index + 1}
    </button>
  )
}

export const PackPuzzlesGridUI = {
  PER_SLIDE_ITEM_COUNT,
  ROW_COUNT,
  COLUMN_COUNT,
  clampSlideIndex,
  toIndex,
  toSlideIndex,
  View,
  ViewAddCell,
  ViewPuzzleCell,
  ViewEmptyCell,
  ViewLoadingCell,
  ViewErrorCell
}
