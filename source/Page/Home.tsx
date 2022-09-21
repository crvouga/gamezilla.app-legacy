import { Cmd, Sub } from "../Core";
import { RoomId, UserId } from "../Data";
import * as GameRoom from "../GameRoom/GameRoom.Frontend";
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

            return [model, Route.push(["GameRoom"]), [['GameRoom', ['Msg', msg[1]]]]]
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
    return Sub.None
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

    return <UI.FillBox>
        <UI.Header
            title="Gamezilla"
        />

        <UI.Box sx={{ paddingX: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Object.values(gameRoom.rooms).map(room => (
                <GameRoom.ViewGameRoomCard
                    key={room.roomId}
                    roomId={room.roomId}
                    hostId={room.hostId}
                    gameName={room.game.type === 'Some' ? room.game.value[0] : undefined}
                    store={store}
                    gameRoom={gameRoom}
                    onClick={() => dispatch(['GameRoomMsg', ['JoinRoom', { roomId: room.roomId, userId: currentUserId }]])}
                />
            ))}
        </UI.Box>

    </UI.FillBox >
}





const ViewNotInRoom = ({ model, dispatch, currentUserId, gameRoom, store }: { currentUserId: UserId.UserId, gameRoom: GameRoom.Model, model: Model, dispatch: (msg: Msg) => void, store: Store.Model }) => {
    return <UI.FillBox>
        <UI.Header
            title="Gamezilla"
        />


        <UI.Box sx={{ flex: 1, padding: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Object.values(gameRoom.rooms).map(room => (
                <GameRoom.ViewGameRoomCard
                    key={room.roomId}
                    roomId={room.roomId}
                    hostId={room.hostId}
                    gameName={room.game.type === 'Some' ? room.game.value[0] : undefined}
                    store={store}
                    gameRoom={gameRoom}
                    onClick={() => dispatch(['GameRoomMsg', ['JoinRoom', { roomId: room.roomId, userId: currentUserId }]])}
                />
            ))}
        </UI.Box>

        <UI.Box sx={{ padding: 2 }}>
            <UI.Button onClick={() => dispatch(['GameRoomMsg', ['CreateRoom', { roomId: RoomId.generate(), userId: currentUserId }]])} fullWidth variant="contained" size="large">
                Start Room
            </UI.Button>
        </UI.Box>

    </UI.FillBox>
}