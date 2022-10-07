import { ProfileAvatar, UserId, Username } from "./Data"
import * as Store from "./Store"

export const userA: Store.Profile.Profile = {
    userId: UserId.generate(),
    avatarUrl: ProfileAvatar.toUrl({ seed: "123", style: "big-ears-neutral" }),
    name: "i_have_a_really_long_username",
    themeMode: "Light",
    username: Username.fromString("i_have_a_really_long_username"),
}

export const userB: Store.Profile.Profile = {
    userId: UserId.generate(),
    avatarUrl: ProfileAvatar.toUrl({ seed: "abc", style: "big-ears-neutral" }),
    name: "Bob",
    themeMode: "Light",
    username: Username.fromString("bob123"),
}

export const userC: Store.Profile.Profile = {
    userId: UserId.generate(),
    avatarUrl: ProfileAvatar.toUrl({
        seed: "someUser",
        style: "big-ears-neutral",
    }),
    name: "SomeUser",
    themeMode: "Light",
    username: Username.fromString("SomeUser"),
}


export const store: Store.Model = {
    ...Store.init,
    Profile: {
        [userA.userId]: userA,
        [userB.userId]: userB,
        [userC.userId]: userC,
    }

}