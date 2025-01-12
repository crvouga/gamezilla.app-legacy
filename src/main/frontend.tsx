import { DebuggerReduxDevTools } from '~/@/program/debugger'
import { Program } from '~/@/program/program'
import { Renderer } from '~/@/vdom/render'
import { renderRuntimeErrors } from '~/app/@/ui/render-runtime-errors'
import * as AppFrontend from '~/app/frontend'
import { BACKEND_URL, VDOM_IMPL } from '~/config/frontend'
import { IS_PROD, TRANSPORT_IMPL } from '~/config/shared'

const main = async () => {
  renderRuntimeErrors()

  const ctx = await AppFrontend.initCtx()

  const root = document.getElementById('root')

  if (!root) {
    throw new Error('Root element not found')
  }

  const render = await Renderer(VDOM_IMPL, root)

  await Program.run({
    initCtx: () => ctx,
    updateCtx: AppFrontend.updateCtx,
    init: AppFrontend.init,
    update: AppFrontend.update,
    subscriptions: AppFrontend.subscriptions,
    render(input) {
      render(<AppFrontend.View {...input} />)
    },

    crash: (input) => console.error('Crash!', input.error),

    debugger: localStorage.getItem(DEBUG_KEY) ? DebuggerReduxDevTools : undefined,
  })

  await ctx.transport.start()

  console.log({
    IS_PROD,
    TRANSPORT_IMPL,
    VDOM_IMPL,
    BACKEND_URL,
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
