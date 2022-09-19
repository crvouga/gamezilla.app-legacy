import { Cmd, Keyboard, Sub } from "../../Core";
import * as UI from "../../UI";
import { initShared, ToFrontend, FrontendModel, FrontendMsg, BackendModel, columnCount, rowCount, toPiece, ToBackend, toGhostPiece } from "./Tetris.Types";
import * as Piece from "./Piece"
import * as Direction from "./Direction"
import * as Board from "./Board"

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

export const init: Model = initShared

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

export const update = ({ sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> }, msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case "PressedKey": {
            const key = msg[1]

            if (key === 'Space') {
                return [model, sendToBackend(['InputDrop'])]
            }

            if (key === 'ArrowUp' || key === 'W' || key === 'w') {
                return [model, sendToBackend(['InputRotate'])]
            }

            const direction = keyToDirection(key)

            if (direction !== 'None') {
                return [model, sendToBackend(['InputTranslate', { direction }])]
            }

            return [model, Cmd.None]


        }
    }
};

const keyToDirection = (key: Keyboard.Key): Direction.Direction | "None" => {
    switch (key) {
        case 'A':
        case 'a':
        case 'ArrowLeft':
            return 'Left'

        case 'D':
        case 'd':
        case 'ArrowRight':
            return 'Right'

        case 'S':
        case 's':
        case 'ArrowDown':
            return 'Down'

        default:
            return 'None'


    }
}


export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {


        case 'InputDrop_Done': {
            const result = msg[1]

            if (result.type === 'Err') {
                return [model, Cmd.None]
            }

            const modelNew = result.value

            return [modelNew, Cmd.None]
        }

        case 'Tick_Done': {
            const modelNew = msg[1]
            return [modelNew, Cmd.None]
        }

        case 'InputRotate_Done': {
            const result = msg[1]

            if (result.type === 'Err') {
                return [model, Cmd.None]
            }

            const modelNew = result.value

            return [modelNew, Cmd.None]
        }

        case 'InputTranslate_Done': {
            const result = msg[1]

            if (result.type === 'Err') {
                return [model, Cmd.None]
            }

            const modelNew = result.value

            return [modelNew, Cmd.None]
        }
    }
}

export const mergeWithBackend = ({ frontendModel, backendModel }: { frontendModel: FrontendModel, backendModel: BackendModel }): FrontendModel => {
    return backendModel
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
    return Keyboard.keyDowns<Msg>(key => ['PressedKey', key])
};


// 
// 
// 
// View
// 
// 
// 




const gridStroke = "rgba(255, 255, 255, 0.2)"
const gridStrokeWidth = 0.025

export const View = ({ model, dispatch, onCloseGame, roomAvatarGroup }: { model: Model, dispatch: (msg: Msg) => void, onCloseGame: () => void, roomAvatarGroup: UI.ViewNode }) => {


    return <UI.FillBox>
        <UI.Header
            left={
                <UI.Button
                    onClick={onCloseGame}
                    sx={{ marginLeft: -1 }}
                >
                    Close
                </UI.Button>
            }
            title="Tetris"
            right={
                roomAvatarGroup
            }
        />
        <svg width="100%" viewBox={[0, 0, columnCount, rowCount,].join(", ")} >
            {range(1, Board.toColumnCount(model.board)).map(x => (
                <line key={x} x1={x} y1={0} x2={x} y2={rowCount} stroke={gridStroke} strokeWidth={gridStrokeWidth} />
            ))}

            {range(1, Board.toRowCount(model.board)).map(y => (
                <line key={y} x1={0} y1={y} x2={columnCount} y2={y} stroke={gridStroke} strokeWidth={gridStrokeWidth} />
            ))}

            {Board.flatMap(model.board, ({ cell, x, y }) => (
                <rect key={`${x}-${y}-${cell}`} width={1} height={1} x={x} y={y} fill={cell === 'Empty' ? 'transparent' : Piece.colors[cell]} />
            ))}

            {toGhostPiece(model).map(position => (
                <rect key={`${position.x}-${position.y}`} width={1} height={1} x={position.x} y={position.y} fill={"rgba(0, 0, 0, 0.4)"} />
            ))}

            {toPiece(model).map(position => (
                <rect key={`${position.x}-${position.y}`} width={1} height={1} x={position.x} y={position.y} fill={Piece.colors[model.tetrominoName]} />
            ))}
        </svg>

    </UI.FillBox>
}


const range = (start: number, end: number): number[] => {
    if (start >= end) {
        return []
    }

    return [start, ...range(start + 1, end)]
}


export const CoverArt = () => {
    return <svg>

    </svg>
}