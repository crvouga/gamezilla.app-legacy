import * as AppClient from "gamezilla-app/@CHILD/app/app.client"
import { Program } from "gamezilla-app/@SHARED/core"
import { DebuggerReduxDevTools } from "gamezilla-app/@SHARED/core/debug"
import { IS_PROD, TRANSPORT_IMPL, VDOM_IMPL } from "gamezilla-app/public-config"
import { Render } from "./@SHARED/vdom"

const main = async () => {
  const deps = await AppClient.getDeps()

  const root = document.getElementById("root")!

  const render = await Render(VDOM_IMPL, root)

  await deps.transport.start()

  await Program.run({
    ctx: AppClient.getCtx,

    init: (input) => AppClient.init({ ...input, deps }),

    update: (input) => AppClient.update({ ...input, deps }),

    subscriptions: (input) => AppClient.subscriptions({ ...input, deps }),

    render: (input) => render(<AppClient.View {...input} />),

    debugger: DebuggerReduxDevTools,
  })

  console.log({ IS_PROD, TRANSPORT_IMPL, VDOM_IMPL })
}

main()
