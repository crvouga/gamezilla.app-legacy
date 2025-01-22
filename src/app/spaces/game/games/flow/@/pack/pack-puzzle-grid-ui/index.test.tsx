import { describe, expect, it } from 'bun:test'
import { FixtureAppFrontend } from '~/app/@/frontend/fixture'
import { PAGINATION_DOTS_TEST_ID } from '~/app/@/ui/pagination-dots'
import { PackPuzzleGridUI } from '.'
import { PuzzleId } from '../../puzzle/puzzle-id'

const Fixture = async () => {
  const f = await FixtureAppFrontend()
  return f
}

describe(import.meta.file, () => {
  it('should not render pagination dots if there is only one slide', async () => {
    const f = await Fixture()
    const r = f.render(<PackPuzzleGridUI.View puzzleIds={[]} />)
    expect(r.getByTestId(PAGINATION_DOTS_TEST_ID)).toEqual([])
  })

  it('should only render one slide when puzzles count is at max per slide', async () => {
    const f = await Fixture()
    const r = f.render(
      <PackPuzzleGridUI.View
        puzzleIds={Array.from({ length: PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT }, PuzzleId.generate)}
      />,
    )
    const slides = r.getByRole('tabpanel')
    expect(slides.length).toBe(1)
  })

  it('should only render two slide when puzzles count is at max per slide and including add button cell', async () => {
    const f = await Fixture()
    const r = f.render(
      <PackPuzzleGridUI.View
        puzzleIds={Array.from({ length: PackPuzzleGridUI.PER_SLIDE_ITEM_COUNT }, PuzzleId.generate)}
        addCell={{ include: true }}
      />,
    )
    const slides = r.getByRole('tabpanel')
    expect(slides.length).toBe(2)
  })
})
