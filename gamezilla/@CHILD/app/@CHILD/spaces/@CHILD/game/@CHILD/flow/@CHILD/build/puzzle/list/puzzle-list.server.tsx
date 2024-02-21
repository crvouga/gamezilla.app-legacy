import { ServerModule } from "../../build.core"

const update: ServerModule["update"] = async (input) => {
  return { model: input.model }
}

export const PuzzleListServer = {
  update,
}
