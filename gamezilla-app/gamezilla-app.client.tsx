import * as AppClient from "gamezilla-app/@CHILD/app/app.client"
import { Program } from "gamezilla-app/@SHARED/core"
import { DebuggerReduxDevTools } from "gamezilla-app/@SHARED/core/debug"
import { Render } from "gamezilla-app/@SHARED/vdom/render"
import { IS_PROD, TRANSPORT_IMPL, VDOM_IMPL } from "gamezilla-app/public-config"

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

    debugger: IS_PROD ? undefined : DebuggerReduxDevTools,
  })

  console.log({ IS_PROD, TRANSPORT_IMPL, VDOM_IMPL })
}

main()
