import { Browser, Posix, Program } from "gamezilla/@SHARED/core"
import { TRANSPORT_IMPL, VDOM_IMPL } from "gamezilla/public-config"
import * as AppClient from "./@CHILD/app/app.client"
import { Render } from "./@SHARED/vdom/render"
import { attachDebuggerBrowserExtension } from "./@SHARED/core/debug"

const main = async () => {
  const deps = AppClient.getDeps()

  const program = Program.create({
    ctx: () => ({ now: Posix.now(), location: Browser.location() }),

    init: (input) => AppClient.init({ ...input, deps }),

    update: (input) => AppClient.update({ ...input, deps }),

    subscriptions: (input) => AppClient.subscriptions({ ...input, deps }),
  })

  const render = await Render(VDOM_IMPL, document.getElementById("root")!)

  program.subscribe((model, ctx) => {
    render(
      <AppClient.View dispatch={program.dispatch} model={model} ctx={ctx} />,
    )
  })

  await program.start()

  await deps.transport.start()

  attachDebuggerBrowserExtension(program)

  console.log(`Renderer: ${VDOM_IMPL}`)
  console.log(`Transport: ${TRANSPORT_IMPL}`)
}

main()
