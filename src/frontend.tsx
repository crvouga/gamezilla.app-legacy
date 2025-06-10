import { Program } from '~/@/program/program'
import { Render } from '~/@/vdom/render'
import { AppFrontend } from '~/app/frontend'
import { CONFIG_FRONTEND } from '~/config/frontend'
import { DebuggerConsole } from './@/program/debugger/debugger-console'
import { CONFIG_SHARED } from './config/shared'

const main = async () => {
  const render = await Render(CONFIG_FRONTEND.VDOM_IMPL, document.getElementById('root')!)

  const ctx = await AppFrontend.initCtx()

  await Program.run({
    init: () => AppFrontend.init({ ctx }),
    update: (input) => AppFrontend.update({ ...input, ctx }),
    subscriptions: (input) => AppFrontend.subscriptions({ ...input, ctx }),
    render: (input) => render(<AppFrontend.View {...input} ctx={ctx} />),
    // debugger: DebuggerReduxDevTools,
    debugger: DebuggerConsole,
  })

  console.table({ ...CONFIG_SHARED, ...CONFIG_FRONTEND })
}

main()
