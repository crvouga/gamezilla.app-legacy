import { describe, expect, test } from 'bun:test'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { FrontendEvt } from '~/app/@/frontend/evt'
import { APP_SOUND, SoundCmd, playSound } from '../../@/frontend/cmd'
import { FixtureAppFrontend } from '../../@/frontend/fixture'
import * as Sound from './index'

type Input =
  | {
      ctx?: AppFrontendCtx
      msg: Sound.Msg
    }
  | {
      ctx?: AppFrontendCtx
      msgCmd: SoundCmd
    }
  | {
      ctx?: AppFrontendCtx
      msgEvt: FrontendEvt
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

describe(import.meta.file, () => {
  //

  test('make sound', async () => {
    const f = await Fixture()
    const after = f.update(f.init, [
      {
        msgCmd: playSound(APP_SOUND.tap),
      },
    ])
    expect(after.eff).toBeTruthy()
  })
})
