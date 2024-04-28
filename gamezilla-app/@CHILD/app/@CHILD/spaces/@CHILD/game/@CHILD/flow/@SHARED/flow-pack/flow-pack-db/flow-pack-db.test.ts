import { describe, it } from "bun:test"
import { FlowPackDb } from "./flow-pack-db-impl"

const Fixture = async () => {
  const flowPackDb = FlowPackDb({
    t: "hash-map",
  })
  return {
    flowPackDb,
  }
}

describe(import.meta.file, () => {
  it("should be able to insert", async () => {
    //
    const f = await Fixture()
    f.flowPackDb
  })
})
