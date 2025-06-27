import { describe, expect, test } from 'bun:test'
import { Sub } from '~/@/sub'
import { BaseFixture } from '../fixture'
import { Checkbox } from './checkbox'

const Fixture = async () => {
  const f = await BaseFixture()

  return {
    ...f,
  }
}

describe('Checkbox', () => {
  test('should render checkbox with check mark when checked', async () => {
    const f = await Fixture()
    await f.render(<Checkbox state='checked' />)
    const [checkbox] = await f.client.query('[role="checkbox"]')
    expect(await checkbox!.text()).toBe('✓')
  })

  test('should render checkbox empty when unchecked', async () => {
    const f = await Fixture()
    await f.render(<Checkbox state='unchecked' />)
    const [checkbox] = await f.client.query('[role="checkbox"]')
    expect(await checkbox!.text()).toBe('')
  })

  test('should render checkbox with dash when indeterminate', async () => {
    const f = await Fixture()
    await f.render(<Checkbox state='indeterminate' />)
    const [checkbox] = await f.client.query('[role="checkbox"]')
    expect(await checkbox!.text()).toBe('—')
  })

  test('should have aria-checked=true when checked', async () => {
    const f = await Fixture()
    await f.render(<Checkbox state='checked' />)
    const [checkbox] = await f.client.query('[role="checkbox"]')
    expect(await checkbox!.attr('aria-checked')).toBe('true')
  })

  test('should have aria-checked=false when unchecked', async () => {
    const f = await Fixture()
    await f.render(<Checkbox state='unchecked' />)
    const [checkbox] = await f.client.query('[role="checkbox"]')
    expect(await checkbox!.attr('aria-checked')).toBe('false')
  })

  test('clicking checkbox triggers onChange when unchecked', async () => {
    const f = await Fixture()
    const onChange = Sub.queued<boolean>()
    await f.render(<Checkbox state='unchecked' onChange={onChange.pub} />)
    const [checkbox] = await f.client.query('[role="checkbox"]')
    expect(checkbox).toBeDefined()
    await checkbox!.do({ t: 'click' })
    expect(await Sub.take(onChange)).toBe(true)
  })

  test('clicking checkbox triggers onChange when checked', async () => {
    const f = await Fixture()
    const onChange = Sub.queued<boolean>()
    await f.render(<Checkbox state='checked' onChange={onChange.pub} />)
    const [checkbox] = await f.client.query('[role="checkbox"]')
    await checkbox!.do({ t: 'click' })
    expect(await Sub.take(onChange)).toBe(false)
  })

  test('should render as button when onChange provided', async () => {
    const f = await Fixture()
    f.render(<Checkbox state='unchecked' onChange={() => {}} />)
    await new Promise((resolve) => setTimeout(resolve, 10))
    const [button] = await f.client.query('button')
    expect(button).toBeDefined()
  })

  test('should render as checkbox when no onChange provided', async () => {
    const f = await Fixture()
    f.render(<Checkbox state='unchecked' />)
    await new Promise((resolve) => setTimeout(resolve, 10))
    const [checkbox] = await f.client.query('[role="checkbox"]')
    expect(checkbox).toBeDefined()
    const [button] = await f.client.query('button')
    expect(button).toBeUndefined()
  })

  describe('pressing enter', () => {
    test('pressing enter triggers onChange when unchecked', async () => {
      const f = await Fixture()
      const onChange = Sub.queued<boolean>()
      await f.render(<Checkbox state='unchecked' onChange={onChange.pub} />)
      const [checkbox] = await f.client.query('[role="checkbox"]')
      await checkbox!.do({ t: 'keydown', key: 'Enter' })
      expect(await Sub.take(onChange)).toBe(true)
    })

    test('pressing enter triggers onChange when checked', async () => {
      const f = await Fixture()
      const onChange = Sub.queued<boolean>()
      await f.render(<Checkbox state='checked' onChange={onChange.pub} />)
      const [checkbox] = await f.client.query('[role="checkbox"]')
      await checkbox!.do({ t: 'keydown', key: 'Enter' })
      expect(await Sub.take(onChange)).toBe(false)
    })
  })
})
