import { describe, expect, it } from 'bun:test'
import { Edit } from '.'
import { Puzzle } from '../puzzle/puzzle'
import { VariantDimensions } from '../variant'

const Fixture = async () => {
  const puzzle = await Puzzle.random()
  const flow = puzzle.flow

  const init = Edit.init({
    flow,
  })
  const update = (init: Edit.Model, msgs: Edit.Msg[]) => {
    let updated: ReturnType<typeof Edit.update> = {
      model: init,
    }

    for (const msg of msgs) {
      updated = Edit.update({
        flow,
        model: updated.model,
        msg,
      })
    }

    return updated
  }

  return {
    puzzle,
    flow,
    init,
    update,
  }
}

describe(import.meta.file, () => {
  it('should make sounds interacting with dimensions form', async () => {
    const f = await Fixture()
    const msgs: Edit.Msg[] = [
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
      expect(updated.msgCmd?.t).toBe('play-sound')
    }
  })
})
