import fs from "node:fs"
import path from "node:path"
import { RenderToString } from "gamezilla-app/@SHARED/vdom/render-to-string"
import { VDOM_IMPL } from "./public-config"
import * as AppClient from "./@CHILD/app/app.client"

const run = async () => {
  console.log("Running SSG")
  const start = Date.now()
  const renderToString = await RenderToString(VDOM_IMPL)

  const ctx = AppClient.getCtx()
  const deps = await AppClient.getDeps()
  const dispatch = () => {}
  const initial = AppClient.init({ deps, ctx })

  const appHtml = renderToString(
    <AppClient.View ctx={ctx} dispatch={dispatch} model={initial.model} />,
  )

  const indexPath = path.join(__dirname, "..", "dist", "index.html")
  const indexHtml = fs.readFileSync(indexPath, "utf-8")
  const finalHtml = indexHtml.replace("<!--ssg-outlet-->", appHtml)

  fs.writeFileSync(indexPath, finalHtml)
  const end = Date.now()
  console.log(`SSG completed in ${end - start}ms`)
}

run()
