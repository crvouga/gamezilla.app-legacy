import { describe, expect, it, test } from 'bun:test'
import { Sub } from '~/@/sub'
import { TestClient } from '~/@/test-client'
import { Render } from '~/@/vdom/render'
import { Checkbox } from './checkbox'
import { VDom } from '~/@/vdom/vdom'

const Fixture = async () => {
  const driver = await TestClient({ t: 'jsdom' })

  document.body.innerHTML = ''

  const root = document.createElement('div')

  document.body.appendChild(root)

  const render = await Render('react', root)

  return {
    driver,
    async render(vDom: VDom) {
      render(vDom)
      await new Promise((resolve) => setTimeout(resolve, 10))
    },
  }
}

describe('Checkbox', () => {
  it('should render checkbox with correct state', async () => {
    const f = await Fixture()

    await f.render(<Checkbox state='checked' />)

    const nodes = await f.driver.query('[role="checkbox"]')
    expect(await nodes[0]?.text()).toBe('✓')

    // Clear and render unchecked state
    document.body.innerHTML = '<div></div>'
    const root2 = document.body.firstElementChild as HTMLElement
    const render2 = await Render('react', root2)
    render2(<Checkbox state='unchecked' />)
    await new Promise((resolve) => setTimeout(resolve, 10))
    const nodes2 = await f.driver.query('[role="checkbox"]')
    expect(await nodes2[0]?.text()).toBe('')

    // Clear and render indeterminate state
    document.body.innerHTML = '<div></div>'
    const root3 = document.body.firstElementChild as HTMLElement
    const render3 = await Render('react', root3)
    render3(<Checkbox state='indeterminate' />)
    await new Promise((resolve) => setTimeout(resolve, 10))
    const nodes3 = await f.driver.query('[role="checkbox"]')
    expect(await nodes3[0]?.text()).toBe('—')
  })

  it('should have correct aria-checked state', async () => {
    const f = await Fixture()
    await f.render(<Checkbox state='checked' />)

    const nodes = await f.driver.query('[role="checkbox"]')
    expect(await nodes[0]?.attr('aria-checked')).toBe('true')

    document.body.innerHTML = '<div></div>'
    const root2 = document.body.firstElementChild as HTMLElement
    const render2 = await Render('react', root2)
    render2(<Checkbox state='unchecked' />)
    await new Promise((resolve) => setTimeout(resolve, 10))
    const nodes2 = await f.driver.query('[role="checkbox"]')
    expect(await nodes2[0]?.attr('aria-checked')).toBe('false')
  })

  test('clicking checkbox triggers onChange when unchecked', async () => {
    const f = await Fixture()
    const onChange = Sub.queued<boolean>()
    await f.render(<Checkbox state='unchecked' onChange={onChange.pub} />)
    const before = await f.driver.query('[role="checkbox"]')
    expect(before.length).toBe(1)
    await before[0]?.do({ t: 'click' })
    expect(await Sub.take(onChange)).toBe(true)
  })

  test('clicking checkbox triggers onChange when checked', async () => {
    const f = await Fixture()
    const onChange = Sub.queued<boolean>()
    await f.render(<Checkbox state='checked' onChange={onChange.pub} />)
    const after = await f.driver.query('[role="checkbox"]')
    await after[0]?.do({ t: 'click' })
    expect(await Sub.take(onChange)).toBe(false)
  })

  test.skip('pressing enter triggers onChange', async () => {
    const f = await Fixture()
    const onChange = Sub.create<boolean>()
    f.render(<Checkbox state='unchecked' onChange={onChange.pub} />)
    const nodes = await f.driver.query('[role="checkbox"]')
    await nodes[0]?.do({ t: 'keydown', key: 'Enter' })
    expect(await Sub.take(onChange)).toBe(true)

    f.render(<Checkbox state='checked' onChange={onChange.pub} />)
    const nodes2 = await f.driver.query('[role="checkbox"]')
    await nodes2[0]?.do({ t: 'keydown', key: 'Enter' })
    expect(await Sub.take(onChange)).toBe(false)
  })

  test('should render as button when onChange provided', async () => {
    const f = await Fixture()
    f.render(<Checkbox state='unchecked' onChange={() => {}} />)
    await new Promise((resolve) => setTimeout(resolve, 10))
    const nodes = await f.driver.query('button')
    expect(nodes.length).toBe(1)
  })

  test('should render as checkbox when no onChange provided', async () => {
    const f = await Fixture()
    f.render(<Checkbox state='unchecked' />)
    await new Promise((resolve) => setTimeout(resolve, 10))
    const nodes = await f.driver.query('[role="checkbox"]')
    expect(nodes.length).toBe(1)
    const nodes2 = await f.driver.query('button')
    expect(nodes2.length).toBe(0)
  })
})
