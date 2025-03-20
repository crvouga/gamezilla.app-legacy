import { describe, expect, it, test } from 'bun:test'
import { ModeEdit } from '.'
import { Flow } from '../flow'
import { Variant, VariantDimensions } from '../variant'
import { VariantGridShorthand } from '../variant/grid'

type Output = ReturnType<typeof ModeEdit.update>

const Fixture = async (input?: { flow?: Variant.Model }) => {
  const flow =
    input?.flow ??
    VariantGridShorthand.toGrid([
      ['A', ' '],
      [' ', 'A'],
    ])

  const init: Output = {
    model: ModeEdit.init({ flow }),
  }

  const update = (acc: Output, [msg, ...msgs]: ModeEdit.Msg[]): Output => {
    if (!msg) return acc
    const updated = ModeEdit.update({ flow, model: acc.model, msg })
    return update(updated, msgs)
  }

  return {
    flow,
    init,
    update,
  }
}

describe.only(import.meta.file, () => {
  it('should make sounds interacting with dimensions form', async () => {
    const f = await Fixture()
    const msgs: ModeEdit.Msg[] = [
      { t: 'dimensions-form.clicked-save' },
      { t: 'dimensions-form.clicked-cancel' },
      { t: 'dimensions-form.clicked-open' },
      { t: 'dimensions-form.closed' },
      { t: 'dimensions-form.inputted', dimensions: VariantDimensions.init({ t: 'flow-grid', height: 0, width: 0 }) },
    ]

    for (const msg of msgs) {
      const updated = f.update(f.init, [msg])
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
    const after = f.update(updated, [
      {
        t: 'dimensions-form.clicked-cancel',
      },
    ])
    const beforeDim = Variant.toDimensions(ModeEdit.toFlow(before.model))
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
    const after = f.update(updated, [
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

  test('clear should only remove terminals not change dimensions', async () => {
    const f = await Fixture()
    const dimensionsNew = VariantDimensions.init({
      t: 'flow-grid',
      height: Math.floor(Math.random() * 10),
      width: Math.floor(Math.random() * 10),
    })
    const updated = f.update(f.init, [
      {
        t: 'dimensions-form.clicked-open',
      },
      {
        t: 'dimensions-form.inputted',
        dimensions: dimensionsNew,
      },
      {
        t: 'dimensions-form.clicked-save',
      },
      {
        t: 'clicked-clear',
      },
    ])
    const actual = Variant.toDimensions(ModeEdit.toFlow(updated.model))
    expect(actual).toEqual(dimensionsNew)
  })

  test('clicking dimensions form open button should toggle open state', async () => {
    const f = await Fixture()
    const afterOpen = f.update(f.init, [{ t: 'dimensions-form.clicked-open' }])
    const afterSecondClick = f.update(afterOpen, [{ t: 'dimensions-form.clicked-open' }])

    expect(afterOpen.model.opened?.t).toBe('dimensions')
    expect(afterSecondClick.model.opened).toBe(null)
  })

  test('ghost terminal should be visible when hovering over node', async () => {
    const f = await Fixture()
    const emptyNode = Flow.randomEmptyNode(f.flow)
    if (!emptyNode) throw new Error('No empty node found')
    const nodeId = emptyNode.nodeId

    const before = f.init
    const after = f.update(before, [{ t: 'hovered-over-node', nodeId }])

    expect(ModeEdit.hasGhostTerminal(before.model, nodeId)).toBe(false)
    expect(ModeEdit.hasGhostTerminal(after.model, nodeId)).toBe(true)
  })
})
