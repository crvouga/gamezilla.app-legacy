import { describe, expect, it, test } from 'bun:test'
import { ModeEdit } from '.'
import { Variant, VariantDimensions } from '../variant'
import { VariantGrid, VariantGridShorthand } from '../variant/grid'

const Fixture = async (input?: { flow?: Variant.Model }) => {
  const flow =
    input?.flow ??
    VariantGridShorthand.toGrid([
      ['A', ' '],
      [' ', 'A'],
    ])

  const init = ModeEdit.init({
    flow,
  })
  const update = (init: ModeEdit.Model, msgs: ModeEdit.Msg[]) => {
    let updated: ReturnType<typeof ModeEdit.update> = { model: init }

    for (const msg of msgs) {
      updated = ModeEdit.update({ flow, model: updated.model, msg })
    }

    return updated
  }

  return {
    flow,
    init,
    update,
  }
}

describe(import.meta.file, () => {
  it('should make sounds interacting with dimensions form', async () => {
    const f = await Fixture()
    const msgs: ModeEdit.Msg[] = [
      {
        t: 'dimensions-form.clicked-save',
      },
      {
        t: 'dimensions-form.clicked-cancel',
      },
      {
        t: 'dimensions-form.clicked-open',
      },
      {
        t: 'dimensions-form.clicked-cancel',
      },
      {
        t: 'dimensions-form.closed',
      },
      {
        t: 'dimensions-form.inputted',
        dimensions: VariantDimensions.init({
          t: 'flow-grid',
          height: 0,
          width: 0,
        }),
      },
    ]

    for (const msg of msgs) {
      const updated = f.update(f.init, [msg])
      console.log(msg)
      expect(updated.msgCmd?.t).toBe('play-sound')
    }
  })

  test('cancel button', async () => {
    const f = await Fixture()
    const before = f.init
    const updated = f.update(before, [
      {
        t: 'dimensions-form.clicked-open',
      },
      {
        t: 'dimensions-form.inputted',
        dimensions: VariantDimensions.init({
          t: 'flow-grid',
          height: Math.floor(Math.random() * 20),
          width: Math.floor(Math.random() * 20),
        }),
      },
    ])
    const after = f.update(updated.model, [
      {
        t: 'dimensions-form.clicked-cancel',
      },
    ])
    const beforeDim = Variant.toDimensions(ModeEdit.toFlow(before))
    const updatedDim = Variant.toDimensions(ModeEdit.toFlow(updated.model))
    const afterDim = Variant.toDimensions(ModeEdit.toFlow(after.model))
    expect(beforeDim).toEqual(afterDim)
    expect(updatedDim).not.toEqual(afterDim)
  })

  test('dimensions should stay applied', async () => {
    const f = await Fixture()
    const updated = f.update(f.init, [
      {
        t: 'dimensions-form.clicked-open',
      },
      {
        t: 'dimensions-form.inputted',
        dimensions: VariantDimensions.init({
          t: 'flow-grid',
          height: Math.floor(Math.random() * 20),
          width: Math.floor(Math.random() * 20),
        }),
      },
      {
        t: 'dimensions-form.clicked-save',
      },
    ])
    const after = f.update(updated.model, [
      {
        t: 'dimensions-form.clicked-open',
      },
    ])
    const afterDim = Variant.toDimensions(ModeEdit.toFlow(after.model))
    const updatedDim = Variant.toDimensions(ModeEdit.toFlow(updated.model))
    expect(afterDim).toEqual(updatedDim)
  })

  test('remove incomplete terminals cut off by smaller dimensions when applied', async () => {
    const flow = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      [' ', ' ', ' '],
      [' ', ' ', 'A'],
    ])
    const f = await Fixture({ flow })

    const updated = f.update(f.init, [
      {
        t: 'dimensions-form.clicked-open',
      },
      {
        t: 'dimensions-form.inputted',
        dimensions: VariantDimensions.init({
          t: 'flow-grid',
          height: 2,
          width: 2,
        }),
      },
      {
        t: 'dimensions-form.clicked-save',
      },
    ])
    expect(ModeEdit.toCurrentPlacingGroupId(updated.model)).toEqual('A')
  })
})
