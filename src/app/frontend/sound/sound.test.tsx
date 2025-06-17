import { describe, expect, test } from 'bun:test'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { APP_SOUND } from '../../@/frontend/app-sound'
import { FixtureAppFrontend } from '../../@/frontend/fixture'
import * as Sound from './sound'

type Input =
  | {
      ctx?: AppFrontendCtx
      msg: Sound.Msg
    }
  | {
      ctx?: AppFrontendCtx
      msgIn: unknown
    }

const Fixture = async () => {
  const f = await FixtureAppFrontend()

  const init = Sound.init({
    ctx: f.ctx,
  }).model

  const update = (init: Sound.Model, inputs: Input[]) => {
    let output: ReturnType<typeof Sound.update> = {
      model: init,
    }
    for (const input of inputs) {
      output = Sound.update({ ctx: input.ctx ?? f.ctx, model: output.model, ...input })
    }

    return output
  }

  return {
    ...f,
    init,
    update,
  }
}

describe('Test', () => {
  //

  test('make sound', async () => {
    const f = await Fixture()
    const after = f.update(f.init, [
      {
        msgIn: PlaySoundCmd.init(APP_SOUND.tap),
      },
    ])
    expect(after.eff).toBeTruthy()
  })
})
