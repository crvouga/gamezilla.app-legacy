import { Alerts } from "@gamezilla/alerts"
import {
    Account,
    Auth,
    Login,
    LoginEmailLink,
    LoginPhone,
    LoginPhoneVerify,
    Logout
} from "@gamezilla/auth"
import { Chat, ChatConversation, ChatNew, ChatStore } from "@gamezilla/chat"
import { Cmd, exhaustive, p, Sub, t } from "@gamezilla/core"
import { PhoneNumber, UserId } from "@gamezilla/data"
import * as Home from "@gamezilla/home"
import { PartyFrontend as Party } from "@gamezilla/party"
import {
    Profile,
    ProfileCreate,
    ProfileDelete, ProfileStore, ProfileUpdate,
    ProfileUpdateAvatar,
    ProfileUpdateName,
    ProfileUpdateTheme,
    ProfileUpdateUsername,
    Search
} from "@gamezilla/profile"
import { RoomFrontend as GameRoom } from "@gamezilla/room"
import { Ctx, Route } from "@gamezilla/shared"
import * as UI from "@gamezilla/ui"

//
//
//
// Model
//
//
//

export type Model =
    | ["Login", Login.Model]
    | ["LoginEmailLink", LoginEmailLink.Model]
    | ["LoginPhone", LoginPhone.Model]
    | ["LoginPhoneVerify", { phoneNumber: PhoneNumber }, LoginPhoneVerify.Model]
    | ["Home", Home.Model]
    | ["ProfileCreate", ProfileCreate.Model]
    | ["Logout", Logout.Model]
    | ["Account", Account.Model]
    | ["Profile", { userId: UserId }, Profile.Model]
    | ["ProfileDelete", ProfileDelete.Model]
    | ["ProfileUpdate", ProfileUpdate.Model]
    | ["ProfileUpdateAvatar", ProfileUpdateAvatar.Model]
    | ["ProfileUpdateName", ProfileUpdateName.Model]
    | ["ProfileUpdateUsername", ProfileUpdateUsername.Model]
    | ["ProfileUpdateTheme", ProfileUpdateTheme.Model]
    | ["Chat", Chat.Model]
    | ["ChatNew", ChatNew.Model]
    | ["Search", Search.Model]
    | ["ChatConversation", { conversationId: string }, ChatConversation.Model]
    | ["Room"]
    | ["Game"]
    | ["Party"]
    | ["Loading"]

//
//
//
// Msg
//
//
//

export type Msg =
    | ["Account", Account.Msg]
    | ["Login", Login.Msg]
    | ["LoginEmailLink", LoginEmailLink.Msg]
    | ["LoginPhone", LoginPhone.Msg]
    | ["LoginPhoneVerify", LoginPhoneVerify.Msg]
    | ["Logout", Logout.Msg]
    | ["Home", Home.Msg]
    | ["Profile", Profile.Msg]
    | ["ProfileCreate", ProfileCreate.Msg]
    | ["ProfileDelete", ProfileDelete.Msg]
    | ["ProfileUpdate", ProfileUpdate.Msg]
    | ["ProfileUpdateAvatar", ProfileUpdateAvatar.Msg]
    | ["ProfileUpdateName", ProfileUpdateName.Msg]
    | ["ProfileUpdateUsername", ProfileUpdateUsername.Msg]
    | ["ProfileUpdateTheme", ProfileUpdateTheme.Msg]
    | ["Chat", Chat.Msg]
    | ["Room", GameRoom.Msg]
    | ["Game", GameRoom.Msg]
    | ["Party", Party.Msg]
    | ["ChatNew", ChatNew.Msg]
    | ["ChatConversation", ChatConversation.Msg]
    | ["Search", Search.Msg]
    | ["ClickedBottomNavigationLink", Route.Model]

export type OutAction =
    | ChatStore.Action
    | Alerts.Action
    | GameRoom.Action
    | Auth.Action
    | Party.Action
    | Route.Action
    | ProfileStore.Action

//
//
//
// Init
//
//
//

export const initLoading = (): [Model, Cmd<Msg>] => {
    return [["Loading"], Cmd.None]
}

export const initReady = (
    route: Route.Model,
    profile: ProfileStore.Profile,
): [Model, Cmd<Msg>, OutAction[]] => {
    switch (route[0]) {
        case "Account":
            return [["Account", Account.init], Cmd.None, []]

        case "Chat": {
            const [model, cmd, actions] = Chat.init(profile)
            return [["Chat", model], p(cmd, Cmd.map(t("Chat"))), actions]
        }

        case "ChatNew": {
            const [chatNew, chatNewCmd, actions] = ChatNew.init()

            return [
                ["ChatNew", chatNew],
                p(chatNewCmd, Cmd.map(t("ChatNew"))),
                actions,
            ]
        }

        case "ChatConversation": {
            const [child, cmd, actions] = ChatConversation.init({
                conversationId: route[1].conversationId,
            })
            return [
                ["ChatConversation", route[1], child],
                Cmd.tag("ChatConversation", cmd),
                actions,
            ]
        }

        case "Logout":
            return [["Logout", Logout.init], Cmd.None, []]

        case "ProfileDelete": {
            const [modelNew, cmdNew, actions] = ProfileDelete.init
            return [
                ["ProfileDelete", modelNew],
                p(cmdNew, Cmd.map(t("ProfileDelete"))),
                actions,
            ]
        }

        case "ProfileUpdate":
            return [["ProfileUpdate", ProfileUpdate.init], Cmd.None, []]

        case "ProfileUpdateAvatar":
            return [
                ["ProfileUpdateAvatar", ProfileUpdateAvatar.init(profile)],
                Cmd.None,
                [],
            ]

        case "ProfileUpdateName":
            return [
                ["ProfileUpdateName", ProfileUpdateName.init(profile)],
                Cmd.None,
                [],
            ]

        case "ProfileUpdateUsername":
            return [
                ["ProfileUpdateUsername", ProfileUpdateUsername.init(profile)],
                Cmd.None,
                [],
            ]

        case "ProfileUpdateTheme":
            return [["ProfileUpdateTheme", ProfileUpdateTheme.init], Cmd.None, []]

        case "Profile": {
            const [modelInit, cmdInit, actions] = Profile.init({
                userId: route[1].userId,
            })
            return [
                ["Profile", { userId: route[1].userId }, modelInit],
                p(cmdInit, Cmd.map(t("Profile"))),
                actions,
            ]
        }

        case "Search": {
            const [modelInit, cmdInit, actionsInit] = Search.init
            return [
                ["Search", modelInit],
                p(cmdInit, Cmd.map(t("Search"))),
                actionsInit,
            ]
        }

        case "Room": {
            return [["Room"], Cmd.None, []]
        }

        case "Game": {
            return [["Game"], Cmd.None, []]
        }

        case "Party": {
            return [["Party"], Cmd.None, []]
        }

        case "Home": {
            const modelInit = Home.init
            return [["Home", modelInit], Cmd.None, []]
        }


        case "ProfileCreate":
        case "Login":
        case "LoginPhone":
        case "LoginPhoneVerify":
        case "LoginEmailLink": {
            return [["Loading"], Route.push(["Home"]), []]
        }

        default:
            return exhaustive(route)
    }
}

export const initLoggedOut = (
    model: Model,
    route: Route.Model,
): [Model, Cmd<Msg>] => {
    switch (route[0]) {
        case "Login": {
            const childNew = model[0] === "Login" ? model[1] : Login.init
            return [["Login", childNew], Cmd.None]
        }

        case "LoginPhone":
            return [["LoginPhone", LoginPhone.init], Cmd.None]

        case "LoginPhoneVerify":
            return [
                [
                    "LoginPhoneVerify",
                    { phoneNumber: route[1].phoneNumber },
                    LoginPhoneVerify.init,
                ],
                Cmd.None,
            ]

        case "LoginEmailLink":
            return [["LoginEmailLink", LoginEmailLink.init], Cmd.None]

        case "Account":
        case "Chat":
        case "ChatConversation":
        case "ChatNew":
        case "Logout":
        case "Profile":
        case "ProfileCreate":
        case "ProfileDelete":
        case "ProfileUpdate":
        case "ProfileUpdateAvatar":
        case "Search":
        case "ProfileUpdateTheme":
        case "Game":
        case "Room":
        case "ProfileUpdateName":
        case "ProfileUpdateUsername":
        case "Party":
        case "Home":
            return [
                ["Login", Login.init],
                Route.push(["Login"]),
            ]

        default:
            return exhaustive(route)
    }
}

export const initProfileMissing = (
    route: Route.Model,
    auth: Auth.Session,
): [Model, Cmd<Msg>] => {
    switch (route[0]) {
        case "ProfileCreate":
            return [["ProfileCreate", ProfileCreate.init(auth)], Cmd.None]

        case "Logout":
            return [["Logout", Logout.init], Cmd.None]

        case "Account":
        case "Chat":
        case "ChatConversation":
        case "ChatNew":
        case "Search":
        case "Profile":
        case "ProfileDelete":
        case "ProfileUpdate":
        case "ProfileUpdateAvatar":
        case "ProfileUpdateTheme":
        case "ProfileUpdateName":
        case "ProfileUpdateUsername":
        case "Login":
        case "LoginEmailLink":
        case "LoginPhone":
        case "LoginPhoneVerify":
        case "Game":
        case "Room":
        case "Home":
        case "Party":
            return [["ProfileCreate", ProfileCreate.init(auth)], Cmd.None]
        default:
            return exhaustive(route)
    }
}

//
//
//
// Update
//
//
//

export const updateReady = (
    {
        profile,
        profileStore,
    }: {
        profileStore: ProfileStore.Model
        profile: ProfileStore.Profile
        gameRoom: GameRoom.Model
    },
    msg: Msg,
    model: Model,
): [Model, Cmd<Msg>, OutAction[]] => {
    if (msg[0] === "ClickedBottomNavigationLink") {
        return [model, Route.push(msg[1]), []]
    }

    switch (model[0]) {
        case "Account":
            if (msg[0] === "Account") {
                const [modelNew, cmdNew] = Account.update(
                    msg[1],
                    model[1],
                )
                return [["Account", modelNew], Cmd.tag('Account', cmdNew), []]
            }
            return [model, Cmd.None, []]

        case "Logout":
            if (msg[0] === "Logout") {
                return tag("Logout", Logout.update(msg[1], model[1]))
            }
            return [model, Cmd.None, []]

        case "ProfileDelete":
            if (msg[0] === "ProfileDelete") {
                return tag(
                    "ProfileDelete",
                    ProfileDelete.update(profile, msg[1], model[1]),
                )
            }
            return [model, Cmd.None, []]

        case "ProfileUpdate":
            if (msg[0] === "ProfileUpdate") {
                return tag(
                    "ProfileUpdate",
                    ProfileUpdate.update(msg[1], model[1]),
                )
            }
            return [model, Cmd.None, []]

        case "ProfileUpdateAvatar":
            if (msg[0] === "ProfileUpdateAvatar") {
                return tag(
                    "ProfileUpdateAvatar",
                    ProfileUpdateAvatar.update(profile, msg[1], model[1]),
                )
            }
            return [model, Cmd.None, []]

        case "ProfileUpdateName":
            if (msg[0] === "ProfileUpdateName") {
                return tag(
                    "ProfileUpdateName",
                    ProfileUpdateName.update(profile, msg[1], model[1]),
                )
            }
            return [model, Cmd.None, []]

        case "ProfileUpdateUsername":
            if (msg[0] === "ProfileUpdateUsername") {
                return tag(
                    "ProfileUpdateUsername",
                    ProfileUpdateUsername.update(profile, msg[1], model[1]),
                )
            }
            return [model, Cmd.None, []]

        case "Chat":
            if (msg[0] === "Chat") {
                return tag("Chat", Chat.update(msg[1], model[1]))
            }
            return [model, Cmd.None, []]

        case "ChatNew":
            if (msg[0] === "ChatNew") {
                return tag(
                    "ChatNew",
                    ChatNew.update(
                        { profileStore: profileStore, currentUserId: profile.userId },
                        msg[1],
                        model[1],
                    ),
                )
            }
            return [model, Cmd.None, []]

        case "ChatConversation":
            if (msg[0] === "ChatConversation") {
                const [child, cmd, actions] = ChatConversation.update(
                    { userId: profile.userId, conversationId: model[1].conversationId },
                    msg[1],
                    model[2],
                )
                return [
                    ["ChatConversation", model[1], child],
                    Cmd.tag("ChatConversation", cmd),
                    actions,
                ]
            }
            return [model, Cmd.None, []]

        case "ProfileUpdateTheme":
            if (msg[0] === "ProfileUpdateTheme") {
                return tag(
                    "ProfileUpdateTheme",
                    ProfileUpdateTheme.update(profile, msg[1], model[1]),
                )
            }
            return [model, Cmd.None, []]

        case "Profile":
            if (msg[0] === "Profile") {
                const [modelPage, cmdPage, actions] = Profile.update(
                    { currentUserId: profile.userId, userId: model[1].userId },
                    msg[1],
                    model[2],
                )
                return [
                    ["Profile", model[1], modelPage],
                    p(cmdPage, Cmd.map(t("Profile"))),
                    actions,
                ]
            }

            return [model, Cmd.None, []]

        case "Search":
            if (msg[0] === "Search") {
                return tag("Search", Search.update(msg[1], model[1]))
            }

            return [model, Cmd.None, []]

        case "Room": {
            if (msg[0] === "Room") {
                return [["Room"], Cmd.None, [["Room", ['Msg', msg[1]]]]]
            }
            return [model, Cmd.None, []]
        }


        case "Game": {
            if (msg[0] === "Game") {
                return [["Game"], Cmd.None, [["Room", ['Msg', msg[1]]]]]
            }
            return [model, Cmd.None, []]
        }

        case "Party": {
            if (msg[0] === "Party") {
                return [["Party"], Cmd.None, [['Party', ['Msg', msg[1]]]]]
            }

            return [model, Cmd.None, []]
        }

        case "Home": {
            if (msg[0] === "Home") {
                const [child, actions] = Home.update(
                    { currentUserId: profile.userId },
                    msg[1],
                    model[1],
                )
                return [["Home", child], Cmd.None, actions]
            }

            return [model, Cmd.None, []]
        }



        case "Login":
        case "Loading":
        case "ProfileCreate":
        case "LoginPhone":
        case "LoginPhoneVerify":
        case "LoginEmailLink": {
            return [model, Route.push(["Home"]), []]
        }

        default: {
            return exhaustive(model)
        }
    }
}

export const updateProfileMissing = (
    auth: Auth.Session,
    msg: Msg,
    model: Model,
): [Model, Cmd<Msg>, OutAction[]] => {
    switch (model[0]) {
        case "Logout":
            if (msg[0] === "Logout") {
                return tag("Logout", Logout.update(msg[1], model[1]))
            }
            return [model, Cmd.None, []]

        case "ProfileCreate":
            if (msg[0] === "ProfileCreate") {
                return tag(
                    "ProfileCreate",
                    ProfileCreate.update(auth, msg[1], model[1]),
                )
            }
            return [model, Cmd.None, []]

        case "Account":
        case "Login":
        case "Profile":
        case "ProfileDelete":
        case "ProfileUpdate":
        case "ProfileUpdateAvatar":
        case "ProfileUpdateName":
        case "ProfileUpdateUsername":
        case "Chat":
        case "ChatNew":
        case "ChatConversation":
        case "ProfileUpdateTheme":
        case "Game":
        case "Room":
        case "Loading":
        case "LoginEmailLink":
        case "Search":
        case "LoginPhone":
        case "LoginPhoneVerify":
        case "Party":
        case "Home":
            return [model, Route.push(["ProfileCreate"]), []]

        default:
            return exhaustive(model)
    }
}

export const updateLoggedOut = (
    msg: Msg,
    model: Model,
): [Model, Cmd<Msg>, OutAction[]] => {
    switch (model[0]) {
        case "Login":
            if (msg[0] === "Login") {
                const [child, cmd] = Login.update(msg[1], model[1])
                return [["Login", child], Cmd.tag("Login", cmd), []]
            }
            return [model, Cmd.None, []]

        case "LoginEmailLink": {
            if (msg[0] === "LoginEmailLink") {
                return tag(
                    "LoginEmailLink",
                    LoginEmailLink.update(msg[1], model[1]),
                )
            }
            return [model, Cmd.None, []]
        }

        case "LoginPhone": {
            if (msg[0] === "LoginPhone") {
                return tag("LoginPhone", LoginPhone.update(msg[1], model[1]))
            }
            return [model, Cmd.None, []]
        }

        case "LoginPhoneVerify": {
            if (msg[0] === "LoginPhoneVerify") {
                const [child, cmd] = LoginPhoneVerify.update(model[1], msg[1], model[2])
                return [
                    ["LoginPhoneVerify", model[1], child],
                    Cmd.tag("LoginPhoneVerify", cmd),
                    [],
                ]
            }
            return [model, Cmd.None, []]
        }

        case "ProfileCreate":
        case "Account":
        case "ProfileDelete":
        case "ProfileUpdate":
        case "ProfileUpdateAvatar":
        case "ProfileUpdateName":
        case "ProfileUpdateUsername":
        case "Chat":
        case "ChatNew":
        case "ChatConversation":
        case "ProfileUpdateTheme":
        case "Room":
        case 'Game':
        case "Loading":
        case "Logout":
        case "Profile":
        case "Search":
        case "Party":
        case "Home":
            return [model, Route.push(["Login"]), []]

        default:
            return exhaustive(model)
    }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub<Msg> => {
    switch (model[0]) {
        case "ChatNew":
            return Sub.tag("ChatNew", ChatNew.subscriptions(model[1]))

        case "Account":
        case "Chat":
        case "ChatConversation":
        case "Login":
        case "LoginEmailLink":
        case "Logout":
        case "ProfileCreate":
        case "ProfileDelete":
        case "ProfileUpdate":
        case "ProfileUpdateAvatar":
        case "ProfileUpdateTheme":
        case "ProfileUpdateUsername":
        case "ProfileUpdateName":
        case "Loading":
        case "Profile":
        case "Search":
        case "Game":
        case "Room":
        case "Party":
        case "LoginPhone":
        case "LoginPhoneVerify":
        case "Home":
            return Sub.None

        default:
            return exhaustive(model)
    }
}

//
//
//
// View
//
//
//

export const ViewReady = ({
    profile,
    gameRoom,
    chatStore,
    route,
    party,
    model,
    profileStore,
    $send,
    ctx,
}: {
    ctx: Ctx
    route: Route.Model
    gameRoom: GameRoom.Model
    profile: ProfileStore.Profile
    chatStore: ChatStore.Model
    profileStore: ProfileStore.Model
    party: Party.Model
    model: Model
    $send: (msg: Msg) => void
}) => {
    const currentUserId = profile.userId
    switch (model[0]) {
        case "Account":
            return (
                <UI.FillBox>
                    <Account.View
                        username={profile.username}
                        model={model[1]}
                        $send={(msg) => $send(["Account", msg])}
                    />
                    <ViewBottomNavigation
                        currentUserId={currentUserId}
                        route={route}
                        $send={$send}
                    />
                </UI.FillBox>
            )

        case "Chat":
            return (
                <UI.FillBox>
                    <Chat.View
                        ctx={ctx}
                        model={model[1]}
                        $send={(msg) => $send(["Chat", msg])}
                        chatStore={chatStore}
                    />
                    <ViewBottomNavigation
                        currentUserId={currentUserId}
                        route={route}
                        $send={$send}
                    />
                </UI.FillBox>
            )

        case "Search":
            return (
                <UI.FillBox>
                    <Search.View
                        $send={(msg) => $send(["Search", msg])}
                        model={model[1]}
                        profileStore={profileStore}
                    />

                    <ViewBottomNavigation
                        currentUserId={currentUserId}
                        route={route}
                        $send={$send}
                    />
                </UI.FillBox>
            )

        case "ChatNew":
            return (
                <UI.FillBox>
                    <ChatNew.View
                        profileStore={profileStore}
                        chatStore={chatStore}
                        ctx={ctx}
                        model={model[1]}
                        $send={(msg) => $send(["ChatNew", msg])}
                    />
                    <ViewBottomNavigation
                        currentUserId={currentUserId}
                        route={route}
                        $send={$send}
                    />
                </UI.FillBox>
            )

        case "ChatConversation":
            return (
                <ChatConversation.View
                    ctx={ctx}
                    chatStore={chatStore}
                    model={model[2]}
                    conversationId={model[1].conversationId}
                    $send={(msg) => $send(["ChatConversation", msg])}
                />
            )

        case "Logout":
            return <Logout.View model={model[1]} $send={(msg) => $send(["Logout", msg])} />

        case "ProfileDelete":
            return (
                <ProfileDelete.View
                    profileStore={profileStore}
                    userId={profile.userId}
                    model={model[1]}
                    $send={(msg) => $send(["ProfileDelete", msg])}
                />
            )

        case "ProfileUpdate":
            return (
                <UI.FillBox>
                    <ProfileUpdate.View
                        profile={profile}
                        model={model[1]}
                        $send={(msg) => $send(["ProfileUpdate", msg])}
                    />
                    <ViewBottomNavigation
                        currentUserId={currentUserId}
                        route={route}
                        $send={$send}
                    />
                </UI.FillBox>
            )

        case "ProfileUpdateAvatar":
            return (
                <UI.FillBox>
                    <ProfileUpdateAvatar.View
                        model={model[1]}
                        $send={(msg) => $send(["ProfileUpdateAvatar", msg])}
                    />
                    <ViewBottomNavigation
                        currentUserId={currentUserId}
                        route={route}
                        $send={$send}
                    />
                </UI.FillBox>
            )

        case "ProfileUpdateName":
            return (
                <UI.FillBox>
                    <ProfileUpdateName.View
                        model={model[1]}
                        $send={(msg) => $send(["ProfileUpdateName", msg])}
                    />
                    <ViewBottomNavigation
                        currentUserId={currentUserId}
                        route={route}
                        $send={$send}
                    />
                </UI.FillBox>
            )

        case "ProfileUpdateTheme":
            return (
                <UI.FillBox>
                    <ProfileUpdateTheme.View
                        profile={profile}
                        model={model[1]}
                        $send={(msg) => $send(["ProfileUpdateTheme", msg])}
                    />
                    <ViewBottomNavigation
                        currentUserId={currentUserId}
                        route={route}
                        $send={$send}
                    />
                </UI.FillBox>
            )

        case "ProfileUpdateUsername":
            return (
                <UI.FillBox>
                    <ProfileUpdateUsername.View
                        model={model[1]}
                        $send={(msg) => $send(["ProfileUpdateUsername", msg])}
                    />
                    <ViewBottomNavigation
                        currentUserId={currentUserId}
                        route={route}
                        $send={$send}
                    />
                </UI.FillBox>
            )

        case "Profile":
            return (
                <UI.FillBox>
                    <Profile.View
                        userId={model[1].userId}
                        chatStore={chatStore}
                        profileStore={profileStore}
                        currentUserId={profile.userId}
                        model={model[2]}
                        $send={(msg) => $send(["Profile", msg])}
                    />
                    <ViewBottomNavigation
                        currentUserId={currentUserId}
                        route={route}
                        $send={$send}
                    />
                </UI.FillBox>
            )

        case "Room": {
            return (
                <GameRoom.ViewPageRoom
                    ctx={{
                        currentUserId: profile.userId,
                        profiles: profileStore.profiles,
                    }}
                    model={gameRoom}
                    $send={(msg) => $send(["Room", msg])}
                />
            )
        }

        case "Game": {
            return (
                <GameRoom.ViewPageGame
                    ctx={{
                        currentUserId: profile.userId,
                        profiles: profileStore.profiles,
                    }}
                    model={gameRoom}
                    $send={(msg) => $send(["Game", msg])}
                />
            )
        }

        case "Party": {
            return (
                <UI.FillBox>
                    <Party.ViewPage
                        ctx={{ currentUserId, profiles: profileStore.profiles }}
                        model={party}
                        $send={(msg) => $send(["Party", msg])}
                    />

                    <ViewBottomNavigation
                        currentUserId={currentUserId}
                        route={route}
                        $send={$send}
                    />
                </UI.FillBox>
            )
        }

        case "Home": {
            return (
                <ViewTopLevel
                    currentUserId={currentUserId}
                    route={route}
                    $send={$send}
                    gameRoom={gameRoom}
                >
                    <Home.View
                        ctx={{ profiles: profileStore.profiles, currentUserId }}
                        gameRoom={gameRoom}
                        model={model[1]}
                        $send={(msg) => $send(["Home", msg])}
                    />
                </ViewTopLevel>
            )
        }

        case "Login":
        case "ProfileCreate":
        case "Loading":
        case "LoginEmailLink":
        case "LoginPhone":
        case "LoginPhoneVerify":
            return <UI.LoadingPage />

        default:
            return exhaustive(model)
    }
}

export const ViewProfileMissing = ({
    model,
    $send,
}: {
    authSession: Auth.Session
    model: Model
    $send: (msg: Msg) => void
}) => {
    switch (model[0]) {
        case "Logout":
            return <Logout.View model={model[1]} $send={(msg) => $send(["Logout", msg])} />

        case "ProfileCreate":
            return (
                <ProfileCreate.View
                    model={model[1]}
                    $send={(msg) => $send(["ProfileCreate", msg])}
                />
            )

        case "Account":
        case "Chat":
        case "ChatConversation":
        case "ChatNew":
        case "ProfileDelete":
        case "ProfileUpdate":
        case "ProfileUpdateAvatar":
        case "ProfileUpdateTheme":
        case "ProfileUpdateName":
        case "ProfileUpdateUsername":
        case "Login":
        case "LoginPhone":
        case "LoginPhoneVerify":
        case "LoginEmailLink":
        case "Loading":
        case "Search":
        case "Profile":
        case "Game":
        case "Room":
        case "Party":
        case "Home":
            return <UI.LoadingPage />

        default:
            return exhaustive(model)
    }
}

export const ViewLoggedOut = ({
    model,
    $send,
}: {
    model: Model
    $send: (msg: Msg) => void
}) => {
    switch (model[0]) {
        case "Login":
            return (
                <Login.View
                    model={model[1]}
                    $send={(msg) => $send(["Login", msg])}
                />
            )

        case "LoginEmailLink":
            return (
                <LoginEmailLink.View
                    model={model[1]}
                    $send={(msg) => $send(["LoginEmailLink", msg])}
                />
            )

        case "LoginPhone":
            return (
                <LoginPhone.View
                    model={model[1]}
                    $send={(msg) => $send(["LoginPhone", msg])}
                />
            )

        case "LoginPhoneVerify":
            return (
                <LoginPhoneVerify.View
                    phoneNumber={model[1].phoneNumber}
                    model={model[2]}
                    $send={(msg) => $send(["LoginPhoneVerify", msg])}
                />
            )

        case "Account":
        case "Chat":
        case "ChatConversation":
        case "ChatNew":
        case "Game":
        case "Room":
        case "Logout":
        case "ProfileCreate":
        case "ProfileDelete":
        case "ProfileUpdate":
        case "ProfileUpdateAvatar":
        case "ProfileUpdateTheme":
        case "ProfileUpdateName":
        case "ProfileUpdateUsername":
        case "Profile":
        case "Search":
        case "Loading":
        case "Party":
        case "Home":
            return <UI.LoadingPage />

        default:
            return exhaustive(model)
    }
}

//
//
//
//
//
//
//
//

const ViewTopLevel = ({
    children,
    $send,
    route,
    currentUserId,
}: {
    children: UI.ViewNode
    currentUserId: UserId
    route: Route.Model
    $send: (msg: Msg) => void
    gameRoom: GameRoom.Model
}) => {
    return (
        <UI.FillBox>
            {children}
            <ViewBottomNavigation
                currentUserId={currentUserId}
                route={route}
                $send={$send}
            />
        </UI.FillBox>
    )
}

type BottomNavigationItem = {
    route: Route.Model
    filled: UI.ViewNode
    outlined: UI.ViewNode
}

const ViewBottomNavigation = ({
    currentUserId,
    route,
    $send,
}: {
    currentUserId: UserId
    route: Route.Model
    $send: (msg: Msg) => void
}) => {
    const items: BottomNavigationItem[] = [
        {
            route: ["Home"],
            filled: <UI.Icons.Home />,
            outlined: <UI.Icons.HomeOutlined />,
        },
        {
            route: ["Party"],
            filled: <UI.Icons.Group />,
            outlined: <UI.Icons.GroupOutlined />,
        },
        {
            route: ["Search"],
            filled: <UI.Icons.Search />,
            outlined: <UI.Icons.SearchOutlined />,
        },
        {
            route: ["Chat"],
            filled: <UI.Icons.Chat />,
            outlined: <UI.Icons.ChatOutlined />,
        },
        {
            route: ["Profile", { userId: currentUserId }],
            filled: <UI.Icons.AccountCircle />,
            outlined: <UI.Icons.AccountCircleOutlined />,
        },
    ]

    const theme = UI.useTheme()

    return (
        <UI.Box
            sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 52,
                borderTop: `1.5px solid ${theme.palette.divider}`,
            }}
        >
            {items.map((item) => {
                const isSelected = Route.equals(route, item.route)

                return (
                    <UI.ButtonBase
                        key={Route.encode(item.route)}
                        onClick={() => $send(["ClickedBottomNavigationLink", item.route])}
                        sx={{
                            color: isSelected ? "primary.main" : "text.secondary",
                            paddingY: 0,
                            paddingX: 2,
                            display: "flex",
                            flexDirection: "column",
                            flex: 1,
                            width: "100%",
                        }}
                    >
                        {isSelected ? item.filled : item.outlined}
                        <UI.Typography variant="caption">{item.route[0]}</UI.Typography>
                    </UI.ButtonBase>
                )
            })}
        </UI.Box>
    )
}

//
//
//
// Helpers
//
//
//

const tag = <TModel, TMsg, TAction, TPage extends Msg[0]>(
    page: TPage,
    [modelPrev, cmdPrev, actionsPrev = []]:
        | [TModel, Cmd<TMsg>, TAction[]]
        | [TModel, Cmd<TMsg>],
): [[TPage, TModel], Cmd<[TPage, TMsg]>, TAction[]] => {
    return [[page, modelPrev], p(cmdPrev, Cmd.map(t(page))), actionsPrev]
}

