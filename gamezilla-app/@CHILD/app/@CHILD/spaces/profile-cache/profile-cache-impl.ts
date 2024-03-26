import { IDbConnKv } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-kv"
import { ProfileCacheDbKv } from "./profile-cache-impl-db-kv"
import { IProfileCache } from "./profile-cache"

export type Impl = { t: "db-kv"; dbConnKv: IDbConnKv }

export const ProfileCache = (impl: Impl): IProfileCache => {
  switch (impl.t) {
    case "db-kv":
      return ProfileCacheDbKv(impl)
  }
}
