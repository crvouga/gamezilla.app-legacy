import { describe, expect, test } from '~/@/test-runner'
import { Sub } from '~/@/sub'
import { BaseFixture } from '../fixture'
import { Checkbox } from './checkbox'
import { h } from '~/@/vdom/h'

const Fixture = async () => {
  const f = await BaseFixture()

  return {
    ...f,
  }
}

describe('Checkbox', () => {
  test('should render checkbox with check mark when checked', async () => {
    const f = await Fixture()
    f.render(h(Checkbox, { state: 'checked' }))
    const [checkbox] = await f.client.query('[role="checkbox"]')
    expect(await checkbox!.text()).toEqual('✓')
  })

  test('should render checkbox empty when unchecked', async () => {
    const f = await Fixture()
    f.render(h(Checkbox, { state: 'unchecked' }))
    const [checkbox] = await f.client.query('[role="checkbox"]')
    expect(await checkbox!.text()).toEqual('')
  })

  test('should render checkbox with dash when indeterminate', async () => {
    const f = await Fixture()
    f.render(h(Checkbox, { state: 'indeterminate' }))
    const [checkbox] = await f.client.query('[role="checkbox"]')
    expect(await checkbox!.text()).toEqual('—')
  })

  test('should have aria-checked=true when checked', async () => {
    const f = await Fixture()
    f.render(h(Checkbox, { state: 'checked' }))
    const [checkbox] = await f.client.query('[role="checkbox"]')
    const ariaChecked = await checkbox!.attr('aria-checked')
    expect(ariaChecked).toEqual('true')
  })

  test('should have aria-checked=false when unchecked', async () => {
    const f = await Fixture()
    f.render(h(Checkbox, { state: 'unchecked' }))
    const [checkbox] = await f.client.query('[role="checkbox"]')
    const ariaChecked = await checkbox!.attr('aria-checked')
    expect(ariaChecked).toEqual('false')
  })

  test('clicking checkbox triggers onChange when unchecked', async () => {
    const f = await Fixture()
    const onChange = Sub.queued<boolean>()
    f.render(h(Checkbox, { state: 'unchecked', onChange: onChange.pub }))
    const [checkbox] = await f.client.query('[role="checkbox"]')
    expect(checkbox).toBeDefined()
    await checkbox!.do({ t: 'click' })
    expect(await Sub.take(onChange)).toEqual(true)
  })

  test('clicking checkbox triggers onChange when checked', async () => {
    const f = await Fixture()
    const onChange = Sub.queued<boolean>()
    f.render(h(Checkbox, { state: 'checked', onChange: onChange.pub }))
    const [checkbox] = await f.client.query('[role="checkbox"]')
    await checkbox!.do({ t: 'click' })
    expect(await Sub.take(onChange)).toEqual(false)
  })

  test('should render as button when onChange provided', async () => {
    const f = await Fixture()
    f.render(h(Checkbox, { state: 'unchecked', onChange: () => {} }))
    await new Promise((resolve) => setTimeout(resolve, 10))
    const [button] = await f.client.query('button')
    expect(button).toBeDefined()
  })

  test('should render as checkbox when no onChange provided', async () => {
    const f = await Fixture()
    f.render(h(Checkbox, { state: 'unchecked' }))
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
      f.render(h(Checkbox, { state: 'unchecked', onChange: onChange.pub }))
      const [checkbox] = await f.client.query('[role="checkbox"]')
      await checkbox!.do({ t: 'keydown', key: 'Enter' })
      expect(await Sub.take(onChange)).toEqual(true)
    })

    test('pressing enter triggers onChange when checked', async () => {
      const f = await Fixture()
      const onChange = Sub.queued<boolean>()
      f.render(h(Checkbox, { state: 'checked', onChange: onChange.pub }))
      const [checkbox] = await f.client.query('[role="checkbox"]')
      await checkbox!.do({ t: 'keydown', key: 'Enter' })
      expect(await Sub.take(onChange)).toEqual(false)
    })
  })
})
