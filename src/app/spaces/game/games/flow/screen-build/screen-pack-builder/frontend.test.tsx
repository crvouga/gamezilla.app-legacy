import { describe, expect, test } from 'bun:test'
import { FixturePackBuilderFrontend } from './@/fixture/frontend'
import { ScreenPackBuilderFrontend } from './frontend'

const Fixture = async () => {
  const f = await FixturePackBuilderFrontend()
  const dispatch = () => {}
  return {
    ...f,
    dispatch,
  }
}

describe(import.meta.file, () => {
  test('render edit name drawer', async () => {
    const f = await Fixture()
    const r = f.render(
      <ScreenPackBuilderFrontend.View {...f} modelSpace={{ ...f.modelSpace, opened: 'edit-pack-name-drawer' }} />,
    )
    const drawers = r.getByRole('dialog', f.ctx.t('flow.edit-pack-name.pack-name'))
    expect(drawers.length).toBe(1)
  })

  test('render NOT edit name drawer', async () => {
    const f = await Fixture()
    const r = f.render(<ScreenPackBuilderFrontend.View {...f} modelSpace={{ ...f.modelSpace }} />)
    const drawers = r.getByRole('dialog', f.ctx.t('flow.edit-pack-name.pack-name'))
    expect(drawers.length).toBe(0)
  })
})
