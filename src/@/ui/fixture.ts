import { TestClient } from '~/@/test-client'
import { AudioPlayer } from '../audio-player'
import { Logger } from '../logger'
import { TimeSpan } from '../time/time-span'
import { render } from '../vdom/h'
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
  const render_ = (vDom: VDom) => render(vDom, root)

  return {
    client,
    render: render_,
  }
}
