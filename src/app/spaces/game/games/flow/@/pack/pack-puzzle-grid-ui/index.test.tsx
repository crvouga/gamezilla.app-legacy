import { beforeEach, describe, expect, it, test } from 'bun:test'
import { FixtureAppFrontend } from '~/app/@/frontend/fixture'
import { PAGINATION_DOTS_TEST_ID, toPaginationDotSelector } from '~/app/@/ui/pagination-dots'
import { PackPuzzleGridUI } from '.'
import { PuzzleId } from '../../puzzle/puzzle-id'
import { PubSub } from '~/@/sub'

const Fixture = async () => {
  const f = await FixtureAppFrontend()
  return {
    ...f,
  }
}

describe(import.meta.file, () => {
  let f: Awaited<ReturnType<typeof Fixture>>

  beforeEach(async () => {
    f = await Fixture()
  })

  it('should not render pagination dots if there is only one slide', () => {
    const r = f.render(<PackPuzzleGridUI.View puzzleIds={[]} />)
    expect(r.getByTestId(PAGINATION_DOTS_TEST_ID)).toEqual([])
  })

  it('should only render one slide when puzzles count is at max per slide', () => {
    const r = f.render(
      <PackPuzzleGridUI.View
        puzzleIds={Array.from({ length: PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT }, PuzzleId.generate)}
      />,
    )
    const slides = r.getByRole('tabpanel')
    expect(slides.length).toBe(1)
  })

  it('should only render two slide when puzzles count is at max per slide and including add button cell', () => {
    const r = f.render(
      <PackPuzzleGridUI.View
        puzzleIds={Array.from({ length: PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT }, PuzzleId.generate)}
        addCell={{ include: true }}
      />,
    )
    const slides = r.getByRole('tabpanel')
    expect(slides.length).toBe(2)
  })

  it.skip('should change slide when clicking pagination dots', async () => {
    const slideIndex = PubSub.create<number>()
    const r = f.render(
      <PackPuzzleGridUI.View
        puzzleIds={Array.from({ length: PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT * 2 }, PuzzleId.generate)}
        onSlideIndexChanged={slideIndex.pub}
      />,
    )
    r.query(toPaginationDotSelector(1))[0]?.click()
    expect(await slideIndex.once()).toEqual(1)
  })

  test('slide title should show correct end position based on actual puzzle count', async () => {
    const puzzleCount = Math.floor(PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT / 2)
    const r = f.render(<PackPuzzleGridUI.View puzzleIds={Array.from({ length: puzzleCount }, PuzzleId.generate)} />)
    const slideTitle = r.getByRole('tabpanel')[0]?.getByRole('heading')[0]
    expect(slideTitle?.textContent).toBeTruthy()
    expect(slideTitle?.textContent).not.toContain(PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT.toString())
    expect(slideTitle?.textContent).toContain(puzzleCount.toString())
  })

  test('slide title should show correct end position based on actual puzzle count on second slide', async () => {
    const puzzleCount = PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT + Math.floor(PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT / 2)
    const r = f.render(<PackPuzzleGridUI.View puzzleIds={Array.from({ length: puzzleCount }, PuzzleId.generate)} />)
    const slide1Title = r.getByRole('tabpanel')[0]?.getByRole('heading')[0]
    expect(slide1Title?.textContent).toBeTruthy()
    expect(slide1Title?.textContent).toContain(PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT.toString())

    const slide2Title = r.getByRole('tabpanel')[1]?.getByRole('heading')[0]
    expect(slide2Title?.textContent).toBeTruthy()
    expect(slide2Title?.textContent).toContain(puzzleCount.toString())
  })
})
