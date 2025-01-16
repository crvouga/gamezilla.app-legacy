import { DebuggerReduxDevTools } from '~/@/program/debugger'
import { Program } from '~/@/program/program'
import { Renderer } from '~/@/vdom/render'
import * as AppFrontend from '~/app/frontend'
import { CONFIG_FRONTEND } from '~/config/frontend'
import { powerSyncDatabase } from '../../powersync/frontend/database'

const main = async () => {
  try {
    console.log('powersync', 'start')
    powerSyncDatabase.getOptional('SELECT * FROM game_flow_puzzle').then((data) => {
      console.log('powersync', data)
    })
    // @ts-ignore
    window.powerSyncDatabase = powerSyncDatabase
  } catch (e) {
    console.error('powersync', e)
  }
  // renderRuntimeErrors()

  const ctx = await AppFrontend.initCtx()

  const root = document.getElementById('root')

  if (!root) {
    throw new Error('Root element not found')
  }

  const render = await Renderer(CONFIG_FRONTEND.VDOM_IMPL, root)

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

  console.log(CONFIG_FRONTEND)
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
