import { describe, expect, it } from 'bun:test'
import { FixtureAppFrontend } from '~/app/@/frontend/fixture'
import { PAGINATION_DOTS_TEST_ID, PaginationDots } from '~/app/@/ui/pagination-dots'

const Fixture = async () => {
  const f = await FixtureAppFrontend()
  return f
}

describe.only(import.meta.file, () => {
  it('should render pagination dots if there is more than one slide', async () => {
    const f = await Fixture()
    const r = f.render(<PaginationDots activeIndex={0} count={2} />)
    expect(r.getByTestId(PAGINATION_DOTS_TEST_ID)).not.toBe(null)
  })

  it('should NOT render pagination dots if there is only one slide', async () => {
    const f = await Fixture()
    const r = f.render(<PaginationDots activeIndex={0} count={1} />)
    expect(r.getByTestId(PAGINATION_DOTS_TEST_ID)).toBe(null)
  })
})
