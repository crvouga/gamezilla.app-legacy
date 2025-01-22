import { describe, expect, it } from 'bun:test'
import { FixtureAppFrontend } from '~/app/@/frontend/fixture'
import { PAGINATION_DOTS_TEST_ID } from '~/app/@/ui/pagination-dots'
import { PackPuzzleGridUI } from '.'

const Fixture = async () => {
  const f = await FixtureAppFrontend()
  return f
}

describe.only(import.meta.file, () => {
  it('should not render pagination dots if there is only one slide', async () => {
    const f = await Fixture()
    const r = f.render(
      <PackPuzzleGridUI.View
        id='id'
        slideIndex={0}
        onSlideIndexChanged={() => {}}
        puzzleIds={[]}
        renderCell={() => null}
      />,
    )
    expect(r.getByTestId(PAGINATION_DOTS_TEST_ID)).toBe(null)
  })
})
