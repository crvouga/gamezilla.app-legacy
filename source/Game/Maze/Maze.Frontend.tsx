import { Cmd, Set, Sub } from "../../Core";
import { Avatar, Box, Button, FillBox, Typography } from "../../UI";
import { Ctx } from "../Game.Shared";
import { BackendModel, FrontendModel, FrontendMsg, handle, initMaze, initShared, ToBackend, ToFrontend } from "./Maze.Types";

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
        case 'InputMove':
        case 'StartGame':
        case 'StopPlaying':
        case "StartPlaying": {
            return [model, sendToBackend(msg)]
        }
    }
};

export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case 'InputMove':
        case 'StartGame':
        case 'StopPlaying':
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
    if (model.type === 'Setup') {


        return (
            <FillBox>
                <Typography sx={{ pt: 2, px: 2, mb: 1, color: "text.secondary" }}>
                    Players
                </Typography>
                <Button
                    variant="outlined"
                    sx={{ w: 100, mx: 2 }}
                    onClick={() => $d(['StartPlaying', { userId: ctx.currentUserId }])}
                    disabled={handle(['StartPlaying', { userId: ctx.currentUserId }], model).type === 'Err'}
                >
                    Start Playing
                </Button>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2, flex: 1 }}>
                    {Set.toArray(model.players).map(player => (
                        <Box key={player} sx={{ display: 'flex', alignItems: "center", justifyContent: 'center', paddingX: 2, width: '100%', }}>
                            <Avatar src={ctx.profiles[player]?.avatarUrl} sx={{ marginRight: 2 }} />
                            <Typography noWrap sx={{ flex: 1 }}>
                                {ctx.profiles[player]?.username ?? "..."}
                            </Typography>
                            {player === ctx.currentUserId && (
                                <Button onClick={() => $d(['StopPlaying', { userId: ctx.currentUserId }])}>
                                    Stop Playing
                                </Button>
                            )}
                        </Box>
                    ))}
                </Box>

                <Box sx={{ display: "flex", gap: 2, p: 2 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => $d(['StartGame', { userId: ctx.currentUserId }])}
                        disabled={handle(['StartGame', { userId: ctx.currentUserId }], model).type === 'Err'}
                    >
                        Start Game
                    </Button>
                </Box>
            </FillBox >
        )
    }


    const viewBox = [0, 0, model.maze.length, model.maze[0]?.length ?? 0].join(" ")
    const stroke = "#565656"
    const strokeWidth = 0.033
    return <FillBox>
        <svg width="100%" viewBox={viewBox}>
            {model.maze.map((column, x) => column.map((_cell, y) => (
                <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} strokeWidth="0.04" stroke="#565656" />
            )))}
            {Object.values(model.players).map(player => (
                <circle key={player.userId} cx={player.position.x + 1 / 2} cy={player.position.y + 1 / 2} r={1 / 2} fill="#fff" />
            ))}
        </svg>
        <Box sx={{
            maxWidth: "50vw",
            margin: "auto",
            transform: "rotate(45deg)",
            transformOrigin: "center",
            transformBox: "fill-box"
        }}>
            <svg width="100%" viewBox="-1 -1 2 2" style={{ overflow: "hidden" }} >
                <defs>
                    <clipPath id="cut-off-bottom">
                        <circle x="0" y="0" r={1} />
                    </clipPath>
                </defs>
                <circle x="0" y="0" r={1} stroke={stroke} strokeWidth={0.025} />

                <g clipPath="url(#cut-off-bottom)" stroke={stroke} strokeWidth={strokeWidth} >
                    <rect x={-1} y={-1} width={1} height={1} onClick={() => $d(['InputMove', { userId: ctx.currentUserId, direction: "North" }])} ></rect>

                    <rect x={0} y={-1} width={1} height={1} onClick={() => $d(['InputMove', { userId: ctx.currentUserId, direction: "East" }])}></rect>
                    <rect x={0} y={0} width={1} height={1} onClick={() => $d(['InputMove', { userId: ctx.currentUserId, direction: "South" }])}></rect>
                    <rect x={-1} y={0} width={1} height={1} onClick={() => $d(['InputMove', { userId: ctx.currentUserId, direction: "West" }])}></rect>
                </g>
            </svg>
        </Box>
    </FillBox >
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