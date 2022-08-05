import { Cmd, Sub, Uuid } from "../Core";
import { GameName } from "../Games";
import * as Games from "../Games/Frontend";
import * as GameRooms from "../Games/Rooms";
import * as Route from "../Route";
import * as Store from "../Store";
import * as UI from "../UI";

//
//
//
// Model
//
//
//

export type Model = {
    drawer: "Opened" | "Closed"
};

export const init: [Model, Cmd.Cmd<Msg>] = [{ drawer: "Closed" }, Cmd.None];

//
//
//
// Update
//
//
//

export type Msg =
    | ["ClickedLeave"]
    | ["ClickedBack"]
    | ["ClickedCreate",]
    | ["ClickedJoin", { roomId: string }]
    | ["ClickedAvatars"]
    | ["ClosedDrawer"]
    | ["ClickedUser", { userId: string }]
    | ["ClickedGame", GameName]

type OutAction = Games.Action

export const update = ({ currentUserId }: { currentUserId: string }, msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
    switch (msg[0]) {
        case 'ClickedLeave': {
            return [model, Cmd.None, [['Games', ['LeaveRoom', { userId: currentUserId, }]]]];
        }

        case 'ClickedBack': {
            return [model, Route.back, []]
        }

        case 'ClickedCreate': {
            const roomId = Uuid.generateSync()
            return [model, Cmd.None, [["Games", ["CreateRoom", { userId: currentUserId, roomId }]]]]
        }

        case 'ClickedJoin': {
            const roomId = msg[1].roomId
            return [model, Cmd.None, [['Games', ["JoinRoom", { userId: currentUserId, roomId }]]]]
        }

        case 'ClickedAvatars': {
            return [{ ...model, drawer: "Opened" }, Cmd.None, []]
        }

        case 'ClosedDrawer': {
            return [{ ...model, drawer: "Closed" }, Cmd.None, []]
        }

        case 'ClickedUser': {
            return [{ ...model, drawer: "Closed" }, Route.push({ type: "Profile", userId: msg[1].userId }), []]
        }

        case 'ClickedGame': {
            return [model, Cmd.None, []]
        }
    }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
    return Sub.None;

};

//
//
//
// View
//
//
//

export const view =
    ({ currentUserId, games, store }: { games: Games.Model; currentUserId: string, store: Store.Model }, model: Model): UI.View<Msg> => {
        const user = games.rooms.users[currentUserId]

        if (!user) {
            return viewNotInRoom({ currentUserId, games, store }, model)
        }

        const room = games.rooms.rooms[user.roomId]

        if (!room) {
            return viewNotInRoom({ currentUserId, games, store }, model)
        }

        return viewInRoom({ currentUserId, games, room, store }, model)

    };


export const viewNotInRoom =
    ({ currentUserId, games, store }: { games: Games.Model; store: Store.Model, currentUserId: string }, model: Model): UI.View<Msg> =>
        (dispatch) => {
            return (
                <UI.FillBox>
                    <UI.Header left={<UI.HeaderBackButton onClick={() => dispatch(["ClickedBack"])} />} title="Rooms" />
                    <UI.Box sx={{ paddingX: 2 }}>
                        <UI.Button fullWidth size="large" variant="contained" onClick={() => dispatch(['ClickedCreate'])}>
                            New Room
                        </UI.Button>
                    </UI.Box>
                    <UI.List sx={{ overflowY: "scroll" }}>
                        {Object.values(games.rooms.rooms)
                            .map((room) => {
                                const profiles = Object.values(store.Profile).filter(
                                    (profile) => games.rooms.users[profile.userId]?.roomId === room.roomId,
                                )
                                return (
                                    <UI.ListItemButton
                                        key={room.roomId}
                                        onClick={() => {
                                            dispatch(["ClickedJoin", { roomId: room.roomId }])
                                        }}
                                    >
                                        <UI.ListItemAvatar>
                                            <UI.AvatarGroup>
                                                {profiles.map((item) => (
                                                    <UI.Avatar key={item.userId} src={item.avatarUrl} />
                                                ))}
                                            </UI.AvatarGroup>
                                        </UI.ListItemAvatar>
                                        <UI.ListItemText
                                            primaryTypographyProps={{
                                                noWrap: true,
                                                sx: { wordWrap: "break-word" },
                                            }}
                                            primary={profiles.map((item) => item.username).join(",")}
                                        />
                                    </UI.ListItemButton>
                                )
                            })}
                    </UI.List>
                </UI.FillBox>
            )
        };

export const viewInRoom =
    ({ currentUserId, store, games, room }: { store: Store.Model, room: GameRooms.Room; games: Games.Model; currentUserId: string }, model: Model): UI.View<Msg> =>
        (dispatch) => {
            const usersInRoom = Object.values(store.Profile).filter(
                (profile) =>
                    games.rooms.users[profile.userId] &&
                    games.rooms.users[profile.userId]?.roomId === room.roomId,
            )

            return (
                <UI.FillBox>
                    <UI.Toolbar>
                        <UI.Button
                            sx={{ marginLeft: -1 }}
                            onClick={() => dispatch(['ClickedLeave',])}>
                            Leave
                        </UI.Button>
                        <UI.Box sx={{ flex: 1 }}>

                        </UI.Box>
                        <UI.AvatarGroup onClick={() => dispatch(['ClickedAvatars'])}>
                            {usersInRoom.map(profile => (
                                <UI.Avatar key={profile.userId} src={profile.avatarUrl} />
                            ))}
                        </UI.AvatarGroup>
                        <UI.Drawer anchor="bottom" open={model.drawer === 'Opened'} onClose={() => dispatch(['ClosedDrawer'])}>
                            {usersInRoom.map(item => (
                                <UI.ListItemButton onClick={() => dispatch(['ClickedUser', item])} key={item.userId} >
                                    <UI.ListItemAvatar>
                                        <UI.Avatar key={item.userId} src={item.avatarUrl} />
                                    </UI.ListItemAvatar>
                                    <UI.ListItemText
                                        primaryTypographyProps={{
                                            noWrap: true,
                                            sx: { wordWrap: "break-word" },
                                        }}
                                        primary={item.username}
                                    />
                                </UI.ListItemButton>
                            ))}
                        </UI.Drawer>
                    </UI.Toolbar>


                    <GameGrid onClick={gameName => dispatch(['ClickedGame', gameName])} />

                </UI.FillBox >
            )
        };



const GameGrid = ({ onClick }: { onClick: (gameName: GameName) => void }) => {
    return (
        <UI.Box
            sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
            }}
        >
            <GameCard
                icon={<Games.CoverArt game="TicTacToe" />}
                label="Tic Tac Toe"
                onClick={() => onClick("TicTacToe")}
            />

            <GameCard
                icon={<Games.CoverArt game="ConnectFour" />}
                label="Connect Four"
                onClick={() => onClick("ConnectFour")}
            />

            <GameCard
                icon={<Games.CoverArt game="Chess" />}
                label="Chess"
                onClick={() => onClick("Chess")}
            />

            <GameCard
                icon={<Games.CoverArt game="Snake" />}
                label="Snake"
                onClick={() => onClick("Snake")}
            />
        </UI.Box>
    )
}

const GameCard = ({
    icon,
    label,
    onClick,
    disabled = false,
}: {
    icon: React.ReactNode
    label: string
    onClick: () => void
    disabled?: boolean
}) => {
    return (
        <UI.ButtonBase
            disabled={disabled}
            sx={{
                position: "relative",
                overflow: "hidden",
                opacity: disabled ? 0.3 : 1,
            }}
            onClick={onClick}
        >
            {icon}

            <UI.Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                }}
            >
                <UI.Box
                    sx={{
                        width: "100%",
                        padding: 1,
                        paddingTop: 2,
                        background: `linear-gradient(transparent, rgba(0, 0, 0, 0.6))`,
                    }}
                >
                    <UI.Typography color="white" align="left" fontWeight={800}>
                        {label}
                    </UI.Typography>
                </UI.Box>
            </UI.Box>
        </UI.ButtonBase>
    )
}