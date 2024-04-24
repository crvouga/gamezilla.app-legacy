import { PubSub as IPubSub } from "gamezilla-app/@SHARED/core"
import * as ImplPostgres from "./pub-sub-impl-postgres"

export type Impl<T> =
  | {
      t: "in-memory"
    }
  | ({ t: "postgres" } & ImplPostgres.Deps<T>)

export const PubSub = <T>(impl: Impl<T>) => {
  switch (impl.t) {
    case "in-memory": {
      return IPubSub.create<T>()
    }

    case "postgres": {
      return ImplPostgres.PubSub(impl)
    }
  }
}
