import { describe, expect, it, test } from 'bun:test'
import { PubSub } from '~/@/sub'
import { FixtureAppFrontend } from '~/app/@/frontend/fixture'
import { PAGINATION_DOTS_TEST_ID, PaginationDots, toPaginationDotSelector } from '~/app/@/ui/pagination-dots'

const Fixture = async () => {
  const f = await FixtureAppFrontend()
  return f
}

describe(import.meta.file, () => {
  it('should render pagination dots if there is more than one slide', async () => {
    const f = await Fixture()
    const r = f.render(<PaginationDots activeIndex={0} count={2} />)
    expect(r.getByTestId(PAGINATION_DOTS_TEST_ID)).not.toBe(null)
  })

  it('should NOT render pagination dots if there is only one slide', async () => {
    const f = await Fixture()
    const r = f.render(<PaginationDots activeIndex={0} count={1} />)
    expect(r.getByTestId(PAGINATION_DOTS_TEST_ID)[0] ?? null).toBe(null)
  })

  test('clicked dots', async () => {
    const f = await Fixture()
    const clickedIndex = PubSub.create<number>()
    const r = f.render(<PaginationDots activeIndex={0} count={3} onClick={clickedIndex.pub} />)
    r.query(toPaginationDotSelector(1))[0]?.click()
    expect(await clickedIndex.once()).toEqual(1)
  })

  test('should NOT be buttons if no onClick is provided', async () => {
    const f = await Fixture()
    const r = f.render(<PaginationDots activeIndex={0} count={3} />)
    const buttons = r.query('button')
    expect(buttons.length).toEqual(0)
  })
})

