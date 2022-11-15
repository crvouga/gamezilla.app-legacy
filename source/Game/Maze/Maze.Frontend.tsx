import { Cmd, Sub } from "../../Core";
import { FillBox, Header, ViewNode } from "../../UI";
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

export const View = ({ model, homeComponent, roomComponent }: { model: Model, dispatch: (msg: Msg) => void, homeComponent: ViewNode, roomComponent: ViewNode }) => {
    return (
        <FillBox>
            <Header
                left={homeComponent}
                title="Maze"
                right={roomComponent}
            />
            {JSON.stringify(model.players)}
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