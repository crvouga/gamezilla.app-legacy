import { Program } from '~/@/program/program'
import { Renderer } from '~/@/vdom/render'
import * as AppFrontend from '~/app/frontend'
import { CONFIG_FRONTEND } from '~/config/frontend'

const main = async () => {
  const root = document.getElementById('root')

  if (!root) throw new Error('Root element not found')

  const render = await Renderer(CONFIG_FRONTEND.VDOM_IMPL, root)

  const ctx = await AppFrontend.initCtx()

  root.innerHTML = ''

  await Program.run({
    initCtx: () => ctx,
    updateCtx: AppFrontend.updateCtx,
    init: AppFrontend.init,
    update: AppFrontend.update,
    subscriptions: AppFrontend.subscriptions,
    render: (input) => render(<AppFrontend.View {...input} />),
    crash: (input) => console.error('Crash!', input.error),
    // debugger: localStorage.getItem(DEBUG_KEY) ? DebuggerReduxDevTools : undefined,
  })

  await ctx.transport.start()

  console.log(CONFIG_FRONTEND)
}

declare global {
  interface Window {
    toggleDebugger: () => void
  }
}

const DEBUG_KEY = 'debug'

window.toggleDebugger = () => {
  storageToggle(localStorage, DEBUG_KEY, 'true')
  window.location.reload()
}

const storageToggle = (storage: Storage, key: string, value: string) => {
  storage.getItem(key) === value ? storage.removeItem(key) : storage.setItem(key, value)
}

main()
