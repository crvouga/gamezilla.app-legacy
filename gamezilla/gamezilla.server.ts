import { Posix, Program, isErr } from "gamezilla/@SHARED/core"
import * as AppServer from "./@CHILD/app/app.server"

const main = async () => {
  const got = await AppServer.getDeps()

  if (isErr(got)) {
    console.error(got.error)
    return
  }

  const deps = got.value

  const program = Program.create({
    getCtx: () => {
      return {
        now: Posix.now(),
      }
    },
    init: async ({ ctx }) => {
      const initial = await AppServer.init({
        ctx,
        deps,
      })

      return initial
    },

    update: async (input) => {
      const updated = await AppServer.update({
        ...input,
        deps,
      })

      return updated
    },

    subscriptions: async (input) => {
      const sub = await AppServer.subscriptions({
        ctx: input.ctx,
        model: input.model,
        deps,
      })

      return sub
    },

    onCrash: (e) => {
      console.error("Crashed!", e)
    },
  })

  program.start()

  deps.logger.info("Server started")
}

main()
