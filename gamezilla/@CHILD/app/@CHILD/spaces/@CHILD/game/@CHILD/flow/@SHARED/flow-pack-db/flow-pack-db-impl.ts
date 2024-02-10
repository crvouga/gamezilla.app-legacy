import { IFlowPackDb } from "./flow-pack-db"
import { FlowPackDbHashMap } from "./flow-pack-db-impl-hash-map"

export type Impl = { t: "hash-map" }

export const FlowPackDb = (impl: Impl): IFlowPackDb => {
  switch (impl.t) {
    case "hash-map": {
      return FlowPackDbHashMap()
    }
  }
}
