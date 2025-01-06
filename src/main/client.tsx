import { DebuggerReduxDevTools } from '~/@/program/debugger'
import { Program } from '~/@/program/program'
import { Render } from '~/@/vdom/render'
import { renderRuntimeErrors } from '~/app/@/ui/render-runtime-errors'
import * as AppClient from '~/app/client'
import { SERVER_URL, VDOM_IMPL } from '~/config/client'
import { IS_PROD, TRANSPORT_IMPL } from '~/config/shared'

const main = async () => {
  renderRuntimeErrors()

  const ctx = await AppClient.initCtx()

  const root = document.getElementById('root')

  if (!root) {
    throw new Error('Root element not found')
  }

  const render = await Render(VDOM_IMPL, root)

  await Program.run({
    initCtx: () => ctx,

    updateCtx: (ctx) => AppClient.updateCtx(ctx),

    init: (input) => AppClient.init(input),

    update: (input) => AppClient.update(input),

    subscriptions: (input) => AppClient.subscriptions(input),

    render: (input) => render(<AppClient.View {...input} />),

    crash: (input) => console.error('Crash!', input.error),

    debugger: localStorage.getItem(DEBUG_KEY) ? DebuggerReduxDevTools : undefined,
  })

  await ctx.transport.start()

  console.log({
    IS_PROD,
    TRANSPORT_IMPL,
    VDOM_IMPL,
    SERVER_URL,
  })
}

declare global {
  interface Window {
    toggleDebugger: () => void
  }
}

const DEBUG_KEY = 'debug'

window.toggleDebugger = () => {
  if (localStorage.getItem(DEBUG_KEY)) {
    localStorage.removeItem(DEBUG_KEY)
  } else {
    localStorage.setItem(DEBUG_KEY, 'true')
  }

  window.location.reload()
}

main()
