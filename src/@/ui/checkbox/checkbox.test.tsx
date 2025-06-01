import { describe, expect, it, test } from 'bun:test'
import { Sub } from '~/@/sub'
import { FixtureAppFrontend } from '~/app/@/frontend/fixture'
import { Checkbox } from './checkbox'

const Fixture = async () => {
  const f = await FixtureAppFrontend()
  return f
}

describe(import.meta.file, () => {
  it('should render checkbox with correct state', async () => {
    const f = await Fixture()
    const r = f.render(<Checkbox state='checked' />)
    expect(r.query('[role="checkbox"]')[0]?.textContent).toBe('✓')

    const r2 = f.render(<Checkbox state='unchecked' />)
    expect(r2.query('[role="checkbox"]')[0]?.textContent).toBe('')

    const r3 = f.render(<Checkbox state='indeterminate' />)
    expect(r3.query('[role="checkbox"]')[0]?.textContent).toBe('—')
  })

  it('should have correct aria-checked state', async () => {
    const f = await Fixture()
    const r = f.render(<Checkbox state='checked' />)
    expect(r.query('[role="checkbox"]')[0]?.getAttribute('aria-checked')).toBe('true')

    const r2 = f.render(<Checkbox state='unchecked' />)
    expect(r2.query('[role="checkbox"]')[0]?.getAttribute('aria-checked')).toBe('false')
  })

  test.todo('clicking checkbox triggers onChange', async () => {
    const f = await Fixture()
    const onChange = Sub.create<boolean>()
    const r = f.render(<Checkbox state='unchecked' onChange={onChange.pub} />)
    await r.query('[role="checkbox"]')[0]?.click()
    expect(await Sub.once(onChange)).toBe(true)

    const r2 = f.render(<Checkbox state='checked' onChange={onChange.pub} />)
    await r2.query('[role="checkbox"]')[0]?.click()
    expect(await Sub.once(onChange)).toBe(false)
  })

  test.todo('pressing enter triggers onChange', async () => {
    const f = await Fixture()
    const onChange = Sub.create<boolean>()
    const r = f.render(<Checkbox state='unchecked' onChange={onChange.pub} />)
    await r.query('[role="checkbox"]')[0]?.keydown('Enter')
    expect(await Sub.once(onChange)).toBe(true)

    const r2 = f.render(<Checkbox state='checked' onChange={onChange.pub} />)
    r2.query('[role="checkbox"]')[0]?.keydown('Enter')
    expect(await Sub.once(onChange)).toBe(false)
  })

  test('should render as button when onChange provided', async () => {
    const f = await Fixture()
    const r = f.render(<Checkbox state='unchecked' onChange={() => {}} />)
    expect(r.query('button').length).toBe(1)
  })

  test('should render as div when no onChange provided', async () => {
    const f = await Fixture()
    const r = f.render(<Checkbox state='unchecked' />)
    expect(r.query('div[role="checkbox"]').length).toBe(1)
    expect(r.query('button').length).toBe(0)
  })
})
