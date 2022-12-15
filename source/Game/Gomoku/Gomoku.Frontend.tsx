import { Cmd, Sub } from "../../Core";
import { ToFrontend, FrontendMsg, FrontendModel, ToBackend, BackendModel } from "./Gomoku.Types"
import * as UserVsUser from "./UserVsUser/UserVsUser.Frontend"
import * as UserVsBot from "./UserVsBot/UserVsBot.Frontend"
import { Ctx, GameModeSelectPage, GameRoomCtx } from "../Game.Shared";

//
//
//
// model
//
//
//

export type Model = FrontendModel;


export const init: Model = {
    type: "None"
}

//
//
//
// update
//
//
//

export type Msg = FrontendMsg

export const update = ({ sendToBackend, }: { sendToBackend: (m: ToBackend) => Cmd }, msg: Msg, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case "InputMode": {
            return [model, sendToBackend(msg)]
        }
        case 'UserVsBot': {
            return [model, Cmd.None]
        }
        case 'UserVsUser': {
            return [model, Cmd.None]
        }
    }
};


export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case "InputMode": {
            if (msg[2].type === 'Err') {
                return [model, Cmd.None]
            }
            const merged = mergeWithBackend({ frontendModel: model, backendModel: msg[2].value })
            return [merged, Cmd.None]
        }

        case 'UserVsBot': {
            return [model, Cmd.None]
        }
        case 'UserVsUser': {
            return [model, Cmd.None]
        }
    }
};

export const mergeWithBackend = ({ frontendModel, backendModel }: { frontendModel: FrontendModel, backendModel: BackendModel }): FrontendModel => {
    switch (backendModel.type) {
        case 'None': {
            return { type: "None" }
        }

        case 'UserVsBot': {
            if (frontendModel.type === 'UserVsBot') {
                return { type: "UserVsBot", child: UserVsBot.mergeWithBackend({ frontendModel: frontendModel.child, backendModel: backendModel.child }) }
            }
            return { type: "UserVsBot", child: UserVsBot.mergeWithBackend({ frontendModel: UserVsBot.init, backendModel: backendModel.child }) }
        }

        case 'UserVsUser': {
            if (frontendModel.type === 'UserVsUser') {
                return { type: "UserVsUser", child: UserVsUser.mergeWithBackend({ frontendModel: frontendModel.child, backendModel: backendModel.child }) }
            }
            return { type: "UserVsUser", child: UserVsUser.mergeWithBackend({ frontendModel: UserVsUser.init, backendModel: backendModel.child }) }
        }
    }
}

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
    return Sub.None;
};

// 
// 
// 
// view
// 
// 
// 

export const view = ({ model, ctx, gameRoomCtx }: { model: Model, ctx: Ctx, gameRoomCtx: GameRoomCtx, }) => {
    switch (model.type) {
        case 'None': {
            return (
                <GameModeSelectPage
                    coverArt={<>cover art</>}
                    ctx={ctx}
                    gameRoomCtx={gameRoomCtx}
                    onUserVsComputer={() => { }}
                    onUserVsUser={() => { }}
                    title="Gomoku"
                />
            )
        }

        case 'UserVsBot': {
            return UserVsBot.view({ model: model.child, })
        }

        case 'UserVsUser': {
            return UserVsUser.view({ model: model.child, })
        }
    }

}

export const coverArt = () => {
    return <svg width={"100%"} viewBox="0 0 8 8">
        <rect x={0} y={0} width="100%" height="100%" fill="#000" />
        {Array.from({ length: 8 }).map((_, x) => Array.from({ length: 8 }).map((_, y) => (
            <circle key={[x, y].join("-")} cx={x + 1 / 2} cy={y + 1 / 2} fill={"#fff"} r={0.1} />
        )))}
    </svg>
}