import { TestClient } from '~/@/test-client'
import { AudioPlayer } from '../audio-player'
import { Logger } from '../logger'
import { TimeSpan } from '../time/time-span'
import { Render } from '../vdom/h'

export const BaseFixture = async () => {
  const client = await TestClient({
    t: 'happydom',
    maxWait: TimeSpan.milliseconds(1000),
    poll: TimeSpan.milliseconds(10),
    audioPlayer: AudioPlayer({ t: 'fake', logger: Logger({ t: 'noop' }) }),
  })

  document.body.innerHTML = '<div id="root"></div>'
  const render = Render(document.getElementById('root')!)

  return {
    client,
    render,
  }
}
