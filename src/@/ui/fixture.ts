import { TestClient } from '~/@/test-client'
import { Render } from '~/@/vdom/render'
import { AudioPlayer } from '../audio-player'
import { Logger } from '../logger'
import { TimeSpan } from '../time/time-span'

export const BaseFixture = async () => {
  const client = await TestClient({
    t: 'happydom',
    maxWait: TimeSpan.milliseconds(100),
    poll: TimeSpan.milliseconds(1),
    audioPlayer: AudioPlayer({ t: 'fake', logger: Logger({ t: 'noop' }) }),
  })

  document.body.innerHTML = '<div id="root"></div>'

  const root = document.getElementById('root')!

  const render = await Render('react', root)

  return {
    client,
    render,
  }
}
