import { ProfileAvatar, UserId, Username } from "./Data"
import * as ProfileStore from "./Profile/Profile.Store"
import * as ChatStore from "./Chat/Chat.Store"
import { Ctx } from "./App.Shared"

export const userA: ProfileStore.Profile = {
  userId: UserId.generate(),
  avatarUrl: ProfileAvatar.toUrl({ seed: "123", style: "big-ears-neutral" }),
  name: "i_have_a_really_long_username",
  themeMode: "Light",
  username: Username.fromString("i_have_a_really_long_username"),
}

export const userB: ProfileStore.Profile = {
  userId: UserId.generate(),
  avatarUrl: ProfileAvatar.toUrl({ seed: "abc", style: "big-ears-neutral" }),
  name: "Bob",
  themeMode: "Light",
  username: Username.fromString("bob123"),
}

export const userC: ProfileStore.Profile = {
  userId: UserId.generate(),
  avatarUrl: ProfileAvatar.toUrl({
    seed: "someUser",
    style: "big-ears-neutral",
  }),
  name: "SomeUser",
  themeMode: "Light",
  username: Username.fromString("SomeUser"),
}

export const profileStore: ProfileStore.Model = {
  ...ProfileStore.init,
  profiles: {
    [userA.userId]: userA,
    [userB.userId]: userB,
    [userC.userId]: userC,
  },
}

const currentUserId = userA.userId

export const chatStore: ChatStore.Model = ChatStore.init

export const ctx: Ctx = {
  currentUserId,
  profiles: profileStore.profiles,
}
