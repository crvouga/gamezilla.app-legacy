import { describe, expect, it, test } from 'bun:test'
import { Sub } from '~/@/sub'
import { PAGINATION_DOTS_TEST_ID, PaginationDots, toPaginationDotSelector } from '~/@/ui/pagination-dots'
import { BaseFixture } from '../fixture'

const Fixture = async () => {
  const f = await BaseFixture()
  return {
    ...f,
  }
}

describe.skip('PaginationDots', () => {
  it('should render pagination dots if there is more than one slide', async () => {
    const f = await Fixture()
    f.render(<PaginationDots activeIndex={0} count={2} />)
    const nodes = await f.driver.query(`[data-testid="${PAGINATION_DOTS_TEST_ID}"]`)
    expect(nodes.length).toBe(2)
  })

  it('should NOT render pagination dots if there is only one slide', async () => {
    const f = await Fixture()
    f.render(<PaginationDots activeIndex={0} count={1} />)
    const nodes = await f.driver.query(`[data-testid="${PAGINATION_DOTS_TEST_ID}"]`)
    expect(nodes.length).toBe(0)
  })

  test('clicked dots', async () => {
    const f = await Fixture()
    const clickedIndex = Sub.create<number>()
    f.render(<PaginationDots activeIndex={0} count={3} onClick={clickedIndex.pub} />)
    const nodes = await f.driver.query(toPaginationDotSelector(1))
    await nodes[0]?.do({ t: 'click' })
    expect(await Sub.take(clickedIndex)).toEqual(1)
  })

  test('should NOT be buttons if no onClick is provided', async () => {
    const f = await Fixture()
    f.render(<PaginationDots activeIndex={0} count={3} />)
    const nodes = await f.driver.query('button')
    expect(nodes.length).toEqual(0)
  })
})
