import * as AppClient from "gamezilla-app/app/app.client"
import { Program } from "gamezilla-app/@shared/core"
import { DebuggerReduxDevTools } from "gamezilla-app/@shared/core/debug"
import { IS_PROD, TRANSPORT_IMPL, VDOM_IMPL } from "gamezilla-app/public-config"
import { Render } from "./@shared/vdom"

const main = async () => {
  const deps = await AppClient.getDeps()

  const root = document.getElementById("root")!

  const render = await Render(VDOM_IMPL, root)

  await deps.transport.start()

  await Program.run({
    getCtx: AppClient.getCtx,

    init: (input) => AppClient.init({ ...input, deps }),

    update: (input) => AppClient.update({ ...input, deps }),

    subscriptions: (input) => AppClient.subscriptions({ ...input, deps }),

    render: (input) => render(<AppClient.View {...input} />),

    debugger: DebuggerReduxDevTools,
  })

  console.log({ IS_PROD, TRANSPORT_IMPL, VDOM_IMPL })
}

main()
