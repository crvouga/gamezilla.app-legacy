import { TestClient } from '~/@/test-client'
import { CONFIG_FRONTEND } from '~/config/frontend'
import { AudioPlayer } from '../audio-player'
import { Logger } from '../logger'
import { TimeSpan } from '../time/time-span'
import { render, VDomEngine } from '../vdom/h'
import { VDom } from '../vdom/vdom'

export const BaseFixture = async () => {
  const client = await TestClient({
    t: 'happydom',
    maxWait: TimeSpan.milliseconds(1000),
    poll: TimeSpan.milliseconds(10),
    audioPlayer: AudioPlayer({ t: 'fake', logger: Logger({ t: 'noop' }) }),
  })

  document.body.innerHTML = '<div id="root"></div>'
  const root = document.getElementById('root')!
  await VDomEngine.initialize(CONFIG_FRONTEND.VDOM_IMPL)

  return {
    client,
    render: (vDom: VDom) => render(vDom, root),
  }
}
