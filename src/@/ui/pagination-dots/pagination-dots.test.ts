import { describe, expect, test } from '~/@/test-runner'
import { Sub } from '~/@/sub'
import { PAGINATION_DOTS_TEST_ID, PaginationDots, toPaginationDotSelector } from '~/@/ui/pagination-dots'
import { BaseFixture } from '../fixture'
import { h } from '~/@/vdom/h'

const Fixture = async () => {
  const f = await BaseFixture()
  return {
    ...f,
  }
}

describe('PaginationDots', () => {
  test('should render pagination dots if there is more than one slide', async () => {
    const f = await Fixture()
    f.render(h(PaginationDots, { activeIndex: 0, count: 2 }))
    const nodes = await f.client.query(`[data-testid="${PAGINATION_DOTS_TEST_ID}"] *`)
    expect(nodes.length).toEqual(2)
  })

  test('should NOT render pagination dots if there is only one slide', async () => {
    const f = await Fixture()
    f.render(h(PaginationDots, { activeIndex: 0, count: 1 }))
    const nodes = await f.client.query(`[data-testid="${PAGINATION_DOTS_TEST_ID}"]`)
    expect(nodes.length).toEqual(0)
  })

  test('clicked dots', async () => {
    const f = await Fixture()
    const clickedIndex = Sub.queued<number>()
    f.render(h(PaginationDots, { activeIndex: 0, count: 3, onClick: (index) => clickedIndex.pub(index) }))
    const [firstDot] = await f.client.query(toPaginationDotSelector(1))
    await firstDot!.do({ t: 'click' })
    expect(await Sub.take(clickedIndex)).toEqual(1)
  })

  test('should NOT be buttons if no onClick is provided', async () => {
    const f = await Fixture()
    f.render(h(PaginationDots, { activeIndex: 0, count: 3 }))
    const nodes = await f.client.query('button')
    expect(nodes.length).toEqual(0)
  })
})
