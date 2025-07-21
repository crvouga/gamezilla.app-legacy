import { Program } from '~/@/program/program'
import { AppFrontend } from '~/app/frontend'
import { HttpProtocol } from './@/http/protocol'
import { DebuggerReduxDevTools } from './@/program/debugger'
import { Url } from './@/url/url'
import { h, render, VDomEngine } from './@/vdom'
import { VDomImpl } from './@/vdom/vdom-impl'

const main = async () => {
  const VDOM_IMPL = VDomImpl.getUrl()
  console.log('VDOM_IMPL', VDOM_IMPL)

  const BACKEND_URL = process.env.BACKEND_URL
  if (!BACKEND_URL) throw new Error('BACKEND_URL is not set')
  console.log('BACKEND_URL', BACKEND_URL)

  const TOPIC_URL = process.env.TOPIC_URL
  if (!TOPIC_URL) throw new Error('TOPIC_URL is not set')
  console.log('TOPIC_URL', TOPIC_URL)

  let root = initRoot()
  await VDomEngine.initialize(VDOM_IMPL)

  const windowProtocol = HttpProtocol.fromWindow() ?? 'https'

  const backendUrl = Url.derive(BACKEND_URL, windowProtocol)
  const topicUrl = Url.derive(TOPIC_URL, windowProtocol)

  const ctx = await AppFrontend.initCtx({ backendUrl, topicUrl })

  const program = await Program.run({
    crash: (input) => console.error(input),
    init: () => AppFrontend.init({ ctx }),
    update: (input) => AppFrontend.update({ ...input, ctx }),
    subscriptions: (input) => AppFrontend.subscriptions({ ...input, ctx }),
    render: (input) => render(h(AppFrontend.View, { ...input, ctx }), root),
    debugger: DebuggerReduxDevTools,
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
