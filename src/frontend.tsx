import { Program } from '~/@/program/program'
import { Renderer } from '~/@/vdom/render'
import * as AppFrontend from '~/app/frontend'
import { CONFIG_FRONTEND } from '~/config/frontend'
import { DebuggerConsole } from './@/program/debugger/debugger-console'

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
  render(input) {
    render(<AppFrontend.View {...input} />)
  },
  crash: (input) => {
    console.error('program crashed!', input)
  },
  debugger: DebuggerConsole,
})

await ctx.transport.start()

console.log(CONFIG_FRONTEND)
