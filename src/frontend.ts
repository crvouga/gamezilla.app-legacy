import { Program } from '~/@/program/program'
import { Render, v } from '~/@/vdom/v'
import { AppFrontend } from '~/app/frontend'
import { CONFIG_FRONTEND } from '~/config/frontend'
import { registerServiceWorker } from './app/frontend/update-prompt/update-prompt'
import { CONFIG_SHARED } from './config/shared'

const main = async () => {
  console.table({ ...CONFIG_SHARED, ...CONFIG_FRONTEND })

  const render = Render(document.getElementById('root')!)

  const ctx = await AppFrontend.initCtx()

  registerServiceWorker({ logger: ctx.logger })

  const program = await Program.run({
    init: () => AppFrontend.init({ ctx }),
    update: (input) => AppFrontend.update({ ...input, ctx }),
    subscriptions: (input) => AppFrontend.subscriptions({ ...input, ctx }),
    render: (input) => render(v(AppFrontend.View, { ...input, ctx })),
    crash: (input) => console.error(input),
  })

  // @ts-expect-error
  window.program = program
}

main()
