import { Program } from '~/@/program/program'
import { Render, h, vdomEngineInitialized } from '~/@/vdom/h'
import { AppFrontend } from '~/app/frontend'
import { CONFIG_FRONTEND } from '~/config/frontend'
import { registerServiceWorker } from './app/frontend/update-prompt/update-prompt'
import { CONFIG_SHARED } from './config/shared'

const main = async () => {
  console.table({ ...CONFIG_SHARED, ...CONFIG_FRONTEND })

  await vdomEngineInitialized

  const render = Render(document.getElementById('root')!)

  const ctx = await AppFrontend.initCtx()

  registerServiceWorker({ logger: ctx.logger })

  await Program.run({
    crash: (input) => console.error(input),
    init: () => AppFrontend.init({ ctx }),
    update: (input) => AppFrontend.update({ ...input, ctx }),
    subscriptions: (input) => AppFrontend.subscriptions({ ...input, ctx }),
    render: (input) => render(h(AppFrontend.View, { ...input, ctx })),
  })
}

main()
