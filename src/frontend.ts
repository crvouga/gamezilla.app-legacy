import { Program } from '~/@/program/program'
import { AppFrontend } from '~/app/frontend'
import { CONFIG_FRONTEND } from '~/config/frontend'
import { render, VDomEngine } from './@/vdom'
import { VDomImpl } from './@/vdom/vdom-impl'
import { CONFIG_SHARED } from './config/shared'

const main = async () => {
  console.table({ ...CONFIG_SHARED, ...CONFIG_FRONTEND })

  let root = initRoot()
  await VDomEngine.initialize(CONFIG_FRONTEND.VDOM_IMPL)

  const ctx = await AppFrontend.initCtx()

  const program = await Program.run({
    crash: (input) => console.error(input),
    init: () => AppFrontend.init({ ctx }),
    update: (input) => AppFrontend.update({ ...input, ctx }),
    subscriptions: (input) => AppFrontend.subscriptions({ ...input, ctx }),
    render: (input) => render(AppFrontend.View({ ...input, ctx }), root),
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
