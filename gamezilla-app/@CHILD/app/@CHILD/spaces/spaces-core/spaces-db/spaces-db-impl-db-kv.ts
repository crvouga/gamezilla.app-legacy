import { IDbConnKv } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-kv"
import { SpacesDb } from "./spaces-db"

export const SpacesDbKv = (_: { dbConnKv: IDbConnKv }): SpacesDb => {
  // const spacesById = IDbConnKv.instance<SpaceId, Space.Model>(
  //   dbConnKv,
  //   ["spaces", "spaces-by-id"],
  //   Space.Model,
  // )
  throw new Error("Not implemented")
}
