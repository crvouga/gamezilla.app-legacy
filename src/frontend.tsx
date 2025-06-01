import { Program } from '~/@/program/program'
import { Renderer } from '~/@/vdom/render'
import { AppFrontend } from '~/app/frontend'
import { CONFIG_FRONTEND } from '~/config/frontend'
import { DebuggerReduxDevTools } from './@/program/debugger'
import { DebuggerConsole } from './@/program/debugger/debugger-console'
import { CONFIG_SHARED } from './config/shared'

const main = async () => {
  const root = document.getElementById('root')

  if (!root) throw new Error('Root element not found')

  const render = await Renderer(CONFIG_FRONTEND.VDOM_IMPL, root)

  const ctx = await AppFrontend.initCtx()

  await Program.run({
    init: () => AppFrontend.init({ ctx }),

    update: (input) => AppFrontend.update({ ...input, ctx }),

    subscriptions: (input) => AppFrontend.subscriptions({ ...input, ctx }),

    render: (input) => render(<AppFrontend.View {...input} ctx={ctx} />),

    crash: (input) => console.error('program crashed!', input),

    debugger: CONFIG_SHARED.IS_PROD ? DebuggerConsole : DebuggerReduxDevTools,
  })

  console.table({
    ...CONFIG_SHARED,
    ...CONFIG_FRONTEND,
  })
}

main()
