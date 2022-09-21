import { Cmd, Sub, Uuid } from "../Core";
import { RoomId, UserId } from "../Data";
import * as GameRoom from "../GameRoom/GameRoom.Frontend";
import * as Game from "../GameRoom/Game.Frontend";
import * as Store from "../Store";
import * as UI from "../UI";

//
//
//
// Model
//
//
//

export type Model = {};

export const init: Model = {}

//
//
//
// Update
//
//
//

export type Msg = ["GameRoomMsg", GameRoom.Msg]

export type OutAction = GameRoom.Action

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
    switch (msg[0]) {
        case "GameRoomMsg": {
            return [model, Cmd.None, [['GameRoom', ['Msg', msg[1]]]]]
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

export const View = ({ model, dispatch, currentUserId, gameRoom, store }: { currentUserId: UserId.UserId, gameRoom: GameRoom.Model, model: Model, dispatch: (msg: Msg) => void, store: Store.Model }) => {

    const user = gameRoom.users[currentUserId]

    if (!user) {
        return <ViewNotInRoom
            model={model}
            dispatch={dispatch}
            currentUserId={currentUserId}
            gameRoom={gameRoom} store={store}
        />
    }

    const room = gameRoom.rooms[user.roomId]

    if (!room) {
        return <ViewNotInRoom
            model={model}
            dispatch={dispatch}
            currentUserId={currentUserId}
            gameRoom={gameRoom} store={store}
        />
    }

    const hostProfile = store.Profile[room.hostId]

    return <UI.FillBox>
        <UI.Header
            title="Gamezilla"
        />

        <UI.Box sx={{ paddingX: 2 }}>
            <UI.CardActionArea>
                <UI.Paper variant="outlined" sx={{ overflow: "hidden", display: 'flex' }}>
                    <UI.Box sx={{ width: 100, }}>
                        <UI.AspectRatio aspectRatio={1}>
                            {room.game.type === 'Some' ? (
                                <Game.CoverArt gameName={room.game.value[0]} />
                            ) : (
                                <>
                                    <UI.Icons.Gamepad />
                                </>
                            )}
                        </UI.AspectRatio>
                    </UI.Box>
                    <UI.Box sx={{ padding: 1 }}>
                        <UI.Typography variant="h5">
                            {hostProfile ? `${hostProfile.username}'s room` : "..."}
                        </UI.Typography>
                    </UI.Box>
                </UI.Paper>
            </UI.CardActionArea>
        </UI.Box>

    </UI.FillBox >
}





const ViewNotInRoom = ({ model, dispatch, currentUserId, gameRoom, store }: { currentUserId: UserId.UserId, gameRoom: GameRoom.Model, model: Model, dispatch: (msg: Msg) => void, store: Store.Model }) => {
    return <UI.FillBox>
        <UI.Header
            title="Gamezilla"
        />

        <UI.Box sx={{ paddingX: 2 }}>
            <UI.Button onClick={() => dispatch(['GameRoomMsg', ['CreateRoom', { roomId: RoomId.generate(), userId: currentUserId }]])} fullWidth variant="contained" size="large">
                Start Room
            </UI.Button>
        </UI.Box>

        <UI.Typography sx={{ paddingX: 2, paddingTop: 2, paddingBottom: 1 }} variant="h5">
            Game Rooms
        </UI.Typography>
        <UI.Box sx={{ display: 'flex', flexDirection: "column" }}>
            {Object.values(gameRoom.rooms).map(room => {
                const usersInRoom = Object.values(gameRoom.users).filter(user => user.roomId === room.roomId)
                return (
                    <UI.ButtonBase onClick={() => dispatch(['GameRoomMsg', ['JoinRoom', { roomId: room.roomId, userId: currentUserId }]])} key={room.roomId} sx={{
                        display: 'flex', justifyContent: "flex-start", alignItems: 'center', width: '100%', textAlign: "left", paddingY: 1, paddingX: 2
                    }}>
                        <UI.AvatarGroup sx={{ marginRight: 2 }}>
                            {usersInRoom.map(user => (
                                <UI.Avatar key={user.userId} src={store.Profile[user.userId]?.avatarUrl} />
                            ))}
                        </UI.AvatarGroup>
                        <UI.Box sx={{ flex: 1 }}>
                            <UI.Typography variant='h6'>
                                {usersInRoom.filter(user => user.userId === room.hostId).map(host => {
                                    const username = store.Profile[host.userId]?.username
                                    return username ? `${username}'s room` : "..."
                                }).join("")}
                            </UI.Typography>
                            <UI.Typography variant='subtitle1' color="text.secondary">
                                {`${usersInRoom.length} in room`}
                            </UI.Typography>
                        </UI.Box>
                    </UI.ButtonBase>
                )
            })}
        </UI.Box>

    </UI.FillBox>
}