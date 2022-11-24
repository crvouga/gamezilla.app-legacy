import { UserId } from "./Data"
import * as ProfileStore from "./Profile/Profile.Store"

export type Ctx = {
  profiles: ProfileStore.Model["profiles"]
  currentUserId: UserId
}
