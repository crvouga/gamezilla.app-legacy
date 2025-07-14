import { Program } from '~/@/program/program'
import { AppFrontend } from '~/app/frontend'
import { Url } from './@/url/url'
import { render, VDomEngine } from './@/vdom'
import { VDomImpl } from './@/vdom/vdom-impl'

const main = async () => {
  const VDOM_IMPL = VDomImpl.getUrl({ fallback: 'inferno' })

  const BACKEND_URL = process.env.BACKEND_URL
  if (!BACKEND_URL) throw new Error('BACKEND_URL is not set')

  const TOPIC_URL = process.env.TOPIC_URL
  if (!TOPIC_URL) throw new Error('TOPIC_URL is not set')

  let root = initRoot()
  await VDomEngine.initialize(VDOM_IMPL)

  const ctx = await AppFrontend.initCtx({
    backendUrl: Url.derive(BACKEND_URL),
    topicUrl: Url.derive(TOPIC_URL),
  })

  const program = await Program.run({
    crash: (input) => console.error(input),
    init: () => AppFrontend.init({ ctx }),
    update: (input) => AppFrontend.update({ ...input, ctx }),
    subscriptions: (input) => AppFrontend.subscriptions({ ...input, ctx }),
    render: (input) => render(AppFrontend.View({ ...input, ctx }), root),
  })

  VDomEngine.event.sub(async (input) => {
    VDomImpl.setUrl(input.vdomImpl)
    await VDomEngine.initialize(input.vdomImpl)
    root = initRoot()
    program.render()
  })
}

const initRoot = () => {
  document.body.innerHTML = '<div id="root"></div>'
  const root = document.getElementById('root')!
  return root
}

main()
