import { Cmd, Sub } from "../../Core";
import { Button, FillBox, List, ListItem, ListItemText, Typography } from "../../UI";
import { Ctx } from "../Game.Shared";
import { BackendModel, FrontendModel, FrontendMsg, initMaze, initShared, ToFrontend } from "./Maze.Types";

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

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case "None": {
            return [model, Cmd.None]
        }
    }
};

export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case 'None': {
            return [model, Cmd.None]
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

export const View = ({ model, ctx }: { ctx: Ctx, model: Model, dispatch: (msg: Msg) => void, }) => {
    return (
        <FillBox>
            <Typography sx={{ px: 2, }}>
                Players
            </Typography>
            <Button sx={{ w: 100, mx: 2 }}>
                Start Playing
            </Button>
            <List>
                {Object.values(model.players).map(player => (
                    <ListItem key={player.userId}>
                        <ListItemText primary={ctx.profiles[player.userId]?.username} />
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