import * as Task from "./Task"

export type Uuid = string & { _opaque: typeof Uuid }

declare const Uuid: unique symbol

export const is = (id: unknown): id is Uuid => {
  const regex = new RegExp(
    // source: https://gist.github.com/johnelliott/cf77003f72f889abbc3f32785fa3df8d
    /(?:^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}$)|(?:^0{8}-0{4}-0{4}-0{4}-0{12}$)/u,
  )

  return typeof id === "string" && regex.test(id)
}

export const generate: Task.Task<Uuid> = async () => {
  return generateSync()
}

export const generateSync = (): Uuid => {
  let d = new Date().getTime()
  let d2 = (performance && performance.now && performance.now() * 1000) || 0

  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    let r = Math.random() * 16
    if (d > 0) {
      r = (d + r) % 16 | 0
      d = Math.floor(d / 16)
    } else {
      r = (d2 + r) % 16 | 0
      d2 = Math.floor(d2 / 16)
    }
    return (c == "x" ? r : (r & 0x7) | 0x8).toString(16)
  })

  if (is(uuid)) {
    return uuid
  }

  throw new Error("generated invalid uuid")
}
