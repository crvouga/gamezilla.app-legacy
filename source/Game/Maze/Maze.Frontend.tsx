import { Cmd, Set, Sub } from "../../Core";
import { Button, FillBox, List, ListItem, ListItemText, Typography } from "../../UI";
import { Ctx } from "../Game.Shared";
import { BackendModel, FrontendModel, FrontendMsg, initMaze, initShared, ToBackend, ToFrontend } from "./Maze.Types";

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init: FrontendModel = initShared

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

export const update = ({ sendToBackend }: { sendToBackend: (m: ToBackend) => Cmd }, msg: Msg, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case "StartPlaying": {
            return [model, sendToBackend(msg)]
        }
    }
};

export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case 'StartPlaying': {
            if (msg[2].type === 'Err') {
                return [model, Cmd.None]
            }
            return [msg[2].value, Cmd.None]
        }
    }
}

export const mergeWithBackend = ({ backendModel }: { frontendModel: FrontendModel, backendModel: BackendModel }): FrontendModel => {
    return backendModel
}

// 
// 
// 
// Subscriptions
// 
// 
// 

export const subscriptions = (_model: Model): Sub<Msg> => {
    return Sub.None
}

//
//
//
// View
//
//
//

export const View = ({ model, ctx, $d }: { ctx: Ctx, model: Model, $d: (msg: Msg) => void, }) => {
    return (
        <FillBox>
            <Typography sx={{ pt: 2, px: 2, mb: 1, color: "text.secondary" }}>
                Players
            </Typography>
            <Button variant="outlined" sx={{ w: 100, mx: 2 }} onClick={() => $d(['StartPlaying', { userId: ctx.currentUserId }])}>
                Start Playing
            </Button>
            <List>
                {Set.toArray(model.players).map(player => (
                    <ListItem key={player}>
                        <ListItemText primary={ctx.profiles[player]?.username} />
                    </ListItem>
                ))}
            </List>
        </FillBox>
    )
}

export const CoverArt = () => {
    return (
        <svg viewBox={[0, 0, 4, 4].join(", ")} width={"100%"} height={"100%"}>
            {initMaze({ rowCount: 4, columnCount: 4 }).map((column, columnIndex) => column.map((_cell, rowIndex) => (
                <rect
                    key={[columnIndex, rowIndex].join(", ")}
                    x={columnIndex}
                    y={rowIndex}
                    width={1}
                    height={1}
                    fill="#121212"
                    stroke="#898989"
                    strokeWidth={0.1}
                />
            )))}
        </svg>
    )
}