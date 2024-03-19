import { Program } from "gamezilla-app/@SHARED/core"
import { DebuggerReduxDevTools } from "gamezilla-app/@SHARED/core/debug"
import { Render } from "gamezilla-app/@SHARED/vdom/render"
import { TRANSPORT_IMPL, VDOM_IMPL } from "gamezilla-app/public-config"
import * as AppClient from "./@CHILD/app/app.client"

const main = async () => {
  const deps = await AppClient.getDeps()

  const render = await Render(VDOM_IMPL)

  const root = document.getElementById("root")!

  await deps.transport.start()

  await Program.run({
    ctx: AppClient.getCtx,

    init: (input) => AppClient.init({ ...input, deps }),

    update: (input) => AppClient.update({ ...input, deps }),

    subscriptions: (input) => AppClient.subscriptions({ ...input, deps }),

    render: (input) => render(<AppClient.View {...input} />, root),

    debugger: DebuggerReduxDevTools,
  })

  console.log(`Renderer: ${VDOM_IMPL}`)
  console.log(`Transport: ${TRANSPORT_IMPL}`)
}

main()
