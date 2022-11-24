import { Cmd, Keyboard, Set, Sub } from "../../Core";
import { Avatar, Box, Button, FillBox, IconButton, Icons, InputAdornment, TextField, Typography, useTheme } from "../../UI";
import { Ctx } from "../Game.Shared";
import { Maze } from "./Maze";
import { BackendModel, FrontendModel, FrontendMsg, handle, initShared, ToBackend, ToFrontend } from "./Maze.Types";
import { Direction, Position } from "./Position";

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

export const update = ({ ctx, sendToBackend }: { ctx: Ctx, sendToBackend: (m: ToBackend) => Cmd }, msg: Msg, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {

        // 
        //
        //

        case 'KeyDown': {

            const direction = keyToDirection(msg[1])

            if (!direction) {
                return [model, Cmd.None]
            }

            return [model, sendToBackend(['InputDirection', { userId: ctx.currentUserId, direction }])]
        }

        // 
        //
        //

        case 'InputSeed':
        case 'InputDirection':
        case 'StartGame':
        case 'StopPlaying':
        case "StartPlaying": {
            return [model, sendToBackend(msg)]
        }
    }
};

export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case 'InputSeed':
        case 'InputDirection':
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


const keyToDirection = (key: Keyboard.Key): Direction | null => {
    switch (key) {
        case 'A':
        case 'a':
        case 'ArrowLeft':
            return "West"

        case 'W':
        case 'w':
        case 'ArrowUp':
            return "North"

        case 's':
        case 'S':
        case 'ArrowDown':
            return "South"

        case 'd':
        case 'D':
        case 'ArrowRight':
            return "East"

        default:
            return null
    }
}

// 
// 
// 
// Subscriptions
// 
// 
// 



export const subscriptions = (_model: Model): Sub<Msg> => {
    return Keyboard.keyDowns(key => ['KeyDown', key])
}

//
//
//
// View
//
//
//


const artMaze = Maze.make({ seed: "art maze!", lower: { x: 0, y: 0 }, upper: { x: 27, y: 9 } })
const artMazeViewBox = [artMaze.lower.x, artMaze.lower.y, (artMaze.upper.x - artMaze.lower.x) + 1, (artMaze.upper.y - artMaze.lower.y) + 1].join(" ")


export const View = ({ model, ctx, $d }: { ctx: Ctx, model: Model, $d: (msg: Msg) => void, }) => {
    const theme = useTheme()
    if (model.type === 'Setup') {
        return (
            <FillBox>

                {/* <Box sx={{ width: "25%", pt: 2, mx: 'auto' }}>
                    <CoverArt />
                </Box> */}
                <Box sx={{ position: "relative" }}>
                    <svg viewBox={artMazeViewBox} width={"100%"}>
                        <rect x={artMaze.lower.x} y={artMaze.lower.y} width="100%" height="100%" fill={"#000"} />
                        {artMaze.edges.map(([a, b]) => (
                            <g
                                key={[a.x, a.y, b.x, b.y].join("-")}
                                strokeWidth="0.1"
                                stroke={"#bcbcbc"}
                            >
                                <line x1={a.x + 1 / 2} y1={a.y + 1 / 2} x2={b.x + 1 / 2} y2={b.y + 1 / 2} />
                            </g>
                        ))}
                    </svg>
                    <Box sx={{
                        position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        // background: `linear-gradient(transparent, ${theme.palette.background.default})`
                        background: "rgba(0, 0, 0, 0.5)"
                    }} >
                        <Typography variant="h2" align="center" color='#fff'>
                            Maze
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ px: 2, pt: 2 }}>
                    <TextField
                        disabled={handle(['InputSeed', { userId: ctx.currentUserId, seed: model.seed }], model).type === "Err"}
                        value={model.seed}
                        onChange={e => $d(['InputSeed', { userId: ctx.currentUserId, seed: e.target.value }])}
                        fullWidth
                        label="Seed"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end" onClick={() => $d(['InputSeed', { userId: ctx.currentUserId, seed: `s${Math.floor(Math.random() * 1_000_000_000)}`, }])}>
                                    <IconButton>
                                        <Icons.Shuffle />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>

                <Typography sx={{ pt: 2, px: 2, color: "text.secondary" }}>
                    Players
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, px: 2, mt: 1, flex: 1 }}>
                    {Set.toArray(model.players).map(player => (
                        <Box key={player} sx={{ display: 'flex', alignItems: "center", justifyContent: 'center', width: '100%', }}>
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

                    {!model.players[ctx.currentUserId] && (
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => $d(['StartPlaying', { userId: ctx.currentUserId }])}
                            disabled={handle(['StartPlaying', { userId: ctx.currentUserId }], model).type === 'Err'}
                        >
                            Start Playing
                        </Button>
                    )}

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


    const viewBox = [model.lower.x, model.lower.y, model.upper.x - model.lower.x + 1, model.upper.y - model.lower.y + 1,].join(" ")

    const maze = Maze.makeMemoized(model)

    return <FillBox sx={{ alignItems: "center" }}>
        <svg style={{ maxWidth: "400px", margin: 0, }} width="100%" viewBox={viewBox}>
            <rect x={0} y={0} width="100%" height="100%" fill={theme.palette.background.default} />
            {maze.edges.map(([a, b]) => (
                <g
                    key={[a.x, a.y, b.x, b.y].join("-")}
                    strokeWidth="0.1"
                    stroke={theme.palette.text.secondary}
                >
                    <line x1={a.x + 1 / 2} y1={a.y + 1 / 2} x2={b.x + 1 / 2} y2={b.y + 1 / 2} />
                </g>
            ))}

            {Object.values(model.players).map(player => (
                <circle key={player.userId} cx={player.position.x + 1 / 2} cy={player.position.y + 1 / 2} r={1 / 3} fill={theme.palette.text.primary} />
            ))}
        </svg>
        <Joystick
            activeDirection={model.players[ctx.currentUserId]?.direction}
            onChange={(direction) => $d(['InputDirection', { direction, userId: ctx.currentUserId }])}
            activeFill="#fff"
            fill="#000"
            stroke="#bcbcbc"
        />
    </FillBox>
}



const Joystick = ({
    activeDirection,
    onChange,
    stroke,
    fill,
    activeFill,
}: {
    activeDirection?: Direction;
    onChange: (direction: Direction) => void;
    stroke: string;
    fill: string,
    activeFill: string
}) => {

    return (
        <Box sx={{
            maxWidth: "40vw",
            margin: "auto",
            transform: "rotate(45deg)",
            transformOrigin: "center",
            transformBox: "fill-box"
        }}>
            <svg width="100%" viewBox="-1 -1 2 2" style={{ overflow: "hidden", userSelect: "none", touchAction: "none" }} >
                <defs>
                    <clipPath id="cut-off-bottom">
                        <circle x="0" y="0" r={1} />
                    </clipPath>
                </defs>

                <g strokeWidth={0.025} >
                    <g clipPath="url(#cut-off-bottom)" stroke={stroke} >
                        {Direction.all.map(direction => {
                            const { x, y } = directionToVector(direction)
                            return (
                                <rect
                                    key={direction}
                                    x={x}
                                    y={y}
                                    width={1}
                                    height={1}
                                    fill={activeDirection === direction ? activeFill : fill}
                                    onTouchStart={() => onChange(direction)}
                                    onMouseDown={() => onChange(direction)}

                                />
                            )
                        })}
                    </g>

                    <circle x="0" y="0" r={0.5} fill={fill} style={{ touchAction: "none", userSelect: "none", pointerEvents: "none" }} stroke={stroke} />
                    <circle x="0" y="0" r={0.98} style={{ touchAction: "none", userSelect: "none", pointerEvents: "none" }} fill="transparent" stroke={stroke} />
                </g>
            </svg>
        </Box>
    )
}

const directionToVector = (direction: Direction): Position => {
    switch (direction) {
        case 'East': return { x: 0, y: -1 }
        case 'North': return { x: -1, y: -1 }
        case 'South': return { x: 0, y: 0 }
        case 'West': return { x: -1, y: 0 }
    }
}



const coverArtMaze = Maze.make({ seed: "cover art maze!", lower: { x: 0, y: 0 }, upper: { x: 8, y: 8 } })
const viewBox = [coverArtMaze.lower.x, coverArtMaze.lower.y, (coverArtMaze.upper.x - coverArtMaze.lower.x) + 1, (coverArtMaze.upper.y - coverArtMaze.lower.y) + 1].join(" ")

export const CoverArt = () => {
    const theme = useTheme()
    return (
        <svg viewBox={viewBox} width={"100%"} height={"100%"}>
            <rect x={coverArtMaze.lower.x} y={coverArtMaze.lower.y} width="100%" height="100%" fill={theme.palette.background.default} />
            {coverArtMaze.edges.map(([a, b]) => (
                <g
                    key={[a.x, a.y, b.x, b.y].join("-")}
                    strokeWidth="0.1"
                    stroke={theme.palette.text.secondary}
                >
                    <line x1={a.x + 1 / 2} y1={a.y + 1 / 2} x2={b.x + 1 / 2} y2={b.y + 1 / 2} />
                </g>
            ))}
            {/* <rect x={coverArtMaze.lower.x} y={coverArtMaze.lower.y} width="100%" height="100%" fill="transparent" stroke={stroke} strokeWidth={strokeWidth} /> */}
        </svg>
    )
}