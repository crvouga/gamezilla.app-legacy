import { describe, expect, test } from '~/@/test-runner'
import { ModeEdit } from '.'
import { Numberlink } from '../numberlink'
import { NumberlinkVariant } from '../variant'
import { VariantDimensions } from '../variant/variant-dimensions'
import { VariantGridShorthand } from '../variant/grid/grid-shorthand'

type Output = ReturnType<typeof ModeEdit.update>

const Fixture = async (input?: { numberlink?: NumberlinkVariant.Model }) => {
  const numberlink =
    input?.numberlink ??
    VariantGridShorthand.toGrid([
      ['A', ' '],
      [' ', 'A'],
    ])

  const init: Output = {
    model: ModeEdit.init({ numberlink }),
  }

  const update = (acc: Output, [msg, ...msgs]: ModeEdit.Msg[]): Output => {
    if (!msg) return acc
    const updated = ModeEdit.update({ numberlink, model: acc.model, msg })
    return update(updated, msgs)
  }

  return {
    numberlink,
    init,
    update,
  }
}

describe('ModeEdit', () => {
  test('should make sounds interacting with dimensions form', async () => {
    const f = await Fixture()
    const msgs: ModeEdit.Msg[] = [
      { t: 'dimensions-form.clicked-save' },
      { t: 'dimensions-form.clicked-cancel' },
      { t: 'dimensions-form.clicked-open' },
      { t: 'dimensions-form.closed' },
      {
        t: 'dimensions-form.inputted',
        dimensions: VariantDimensions.init({ t: 'grid', height: 0, width: 0 }),
      },
    ]

    for (const msg of msgs) {
      const updated = f.update(f.init, [msg])
      expect(updated.msgCmd?.t).toEqual('play-sound')
    }
  })

  test('cancel button', async () => {
    const f = await Fixture()
    const before = f.init
    const beforeDim = NumberlinkVariant.toDimensions(ModeEdit.toNumberlink(before.model))
    const updated = f.update(before, [
      {
        t: 'dimensions-form.clicked-open',
      },
      {
        t: 'dimensions-form.inputted',
        dimensions: VariantDimensions.init({
          t: 'grid',
          height: beforeDim.t === 'grid' ? beforeDim.height + 1 : Math.floor(Math.random() * 20),
          width: beforeDim.t === 'grid' ? beforeDim.width + 1 : Math.floor(Math.random() * 20),
        }),
      },
    ])
    const after = f.update(updated, [
      {
        t: 'dimensions-form.clicked-cancel',
      },
    ])

    const updatedDim = NumberlinkVariant.toDimensions(ModeEdit.toNumberlink(updated.model))
    const afterDim = NumberlinkVariant.toDimensions(ModeEdit.toNumberlink(after.model))
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
          t: 'grid',
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
    const afterDim = NumberlinkVariant.toDimensions(ModeEdit.toNumberlink(after.model))
    const updatedDim = NumberlinkVariant.toDimensions(ModeEdit.toNumberlink(updated.model))
    expect(afterDim).toEqual(updatedDim)
  })

  test('remove incomplete terminals cut off by smaller dimensions when applied', async () => {
    const numberlink = VariantGridShorthand.toGrid([
      ['A', ' ', ' '],
      [' ', ' ', ' '],
      [' ', ' ', 'A'],
    ])
    const f = await Fixture({ numberlink: numberlink })

    const updated = f.update(f.init, [
      {
        t: 'dimensions-form.clicked-open',
      },
      {
        t: 'dimensions-form.inputted',
        dimensions: VariantDimensions.init({
          t: 'grid',
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
      t: 'grid',
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
    const actual = NumberlinkVariant.toDimensions(ModeEdit.toNumberlink(updated.model))
    expect(actual).toEqual(dimensionsNew)
  })

  test('clicking dimensions form open button should toggle open state', async () => {
    const f = await Fixture()
    const afterOpen = f.update(f.init, [{ t: 'dimensions-form.clicked-open' }])
    const afterSecondClick = f.update(afterOpen, [{ t: 'dimensions-form.clicked-open' }])

    expect(afterOpen.model.opened?.t).toEqual('dimensions')
    expect(afterSecondClick.model.opened).toEqual(null)
  })

  test('ghost terminal should be visible when hovering over node', async () => {
    const f = await Fixture()
    const emptyNode = Numberlink.randomEmptyNode(f.numberlink)
    if (!emptyNode) throw new Error('No empty node found')
    const nodeId = emptyNode.nodeId

    const before = f.init
    const after = f.update(before, [{ t: 'hovered-over-node', nodeId }])

    expect(ModeEdit.hasGhostTerminal(before.model, nodeId)).toEqual(false)
    expect(ModeEdit.hasGhostTerminal(after.model, nodeId)).toEqual(true)
  })
})
