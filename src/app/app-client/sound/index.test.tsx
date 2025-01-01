import { describe, expect, test } from 'bun:test'
import { AppClientCtx } from '~/app/@/client/client-ctx'
import { ClientEvt } from '~/app/@/client/client-event'
import { APP_SOUND, SoundCmd, playSound } from '../../@/client/client-cmd'
import { FixtureAppClient } from '../../@/client/client-test-env'
import * as Sound from './index'

type Input =
  | {
      ctx?: AppClientCtx
      msg: Sound.Msg
    }
  | {
      ctx?: AppClientCtx
      msgCmd: SoundCmd
    }
  | {
      ctx?: AppClientCtx
      msgEvt: ClientEvt
    }

const Fixture = async () => {
  const f = await FixtureAppClient()

  const init = Sound.init({
    ctx: f.ctx
  }).model

  const update = (init: Sound.Model, inputs: Input[]) => {
    let output: ReturnType<typeof Sound.update> = {
      model: init
    }
    for (const input of inputs) {
      output = Sound.update({ ctx: input.ctx ?? f.ctx, model: output.model, ...input })
    }

    return output
  }

  return {
    ...f,
    init,
    update
  }
}

describe(import.meta.file, () => {
  //

  test('make sound', async () => {
    const f = await Fixture()
    const after = f.update(f.init, [
      {
        msgCmd: playSound(APP_SOUND.tap)
      }
    ])
    expect(after.eff).toBeTruthy()
  })
})
