import { useLayoutEffect, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Audio, Browser, Cmd, pipe, Sub, tag } from "../../../Core";
import { RoomId, UserId } from '../../../Data';
import * as UI from "../../../UI";
import * as Bridge from "../../../Bridge";
import { FrontendModel, FrontendMsg, initSharedModel, move, Move, ToBackend, ToFrontend } from "./Chess.Types";
import { Sounds } from './Sounds';


//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init = (): [FrontendModel, Cmd.Cmd<Msg>] => {
  return [{ ...initSharedModel, boardWidth: 0 }, pipe(Browser.getElementById(containerHtmlId), Cmd.fromTask(result => ['GetElementResulted', result]))]
}

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

export const update = ({ currentRoomId }: { currentRoomId: RoomId.RoomId }, msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case 'GetElementResulted': {
      const result = msg[1]

      if (result.type === "Err") {
        return [model, Cmd.None]

      }

      const element = result.value

      return [{ ...model, boardWidth: element.offsetWidth }, Cmd.None]
    }

    case 'BrowserResized': {
      return [model, pipe(Browser.getElementById(containerHtmlId), Cmd.fromTask((element): Msg => ["GetElementResulted", element]))]
    }

    case 'AudioResulted': {
      return [model, Cmd.None]
    }

    case 'Move': {
      const result = move(msg[1], model)

      if (result.type === 'Err') {
        return [model, Cmd.None]
      }

      const sharedModelNew = result.value

      return [
        { ...model, ...sharedModelNew },
        Cmd.batch([
          sendToBackend(currentRoomId, msg),
          pipe(
            Audio.play(Sounds.move),
            Cmd.fromTask(tag("AudioResulted")))
        ])
      ]

    }
  }
}

export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case 'MovedResulted': {
      return [{ ...model, }, Cmd.None]
    }

    case 'Sync': {
      const sharedModel = msg[1]
      return [{ ...model, ...sharedModel }, Cmd.None]
    }
  }
}

// 
// 
// 
// Subscriptions
// 
// 
// 

export const subscriptions = (_model: Model): Sub.Sub<Msg> => {
  return Browser.onResize((resize) => ['BrowserResized', resize])
}

// 
// 
// 
// Bridge
// 
// 
// 

export const sendToBackend = (roomId: RoomId.RoomId, toBackend: ToBackend) => {
  return Bridge.sendToBackend(['GameRoom', ['Game', { roomId, toBackend: ['Chess', toBackend] }]])
}

//
//
//
// View
//
//
//

const containerHtmlId = "chess"

export const view =
  ({ currentUserId }: { currentUserId: UserId.UserId }, model: Model): UI.View<Msg> =>
    (dispatch) =>
      <View currentUserId={currentUserId} model={model} dispatch={dispatch} />


export const View = ({ currentUserId, model, dispatch }: { currentUserId: UserId.UserId; model: Model, dispatch: (msg: Msg) => void }) => {
  const [boardWidth, setBoardWidth] = useState(0)
  const ref = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const handler = () => {
      if (ref.current) {
        setBoardWidth(ref.current?.offsetWidth)
      }
    }

    handler()

    window.addEventListener("resize", handler)
    return () => {
      window.removeEventListener("resize", handler)
    }
  }, [])

  return <div ref={ref}>
    <UI.FillBox id={containerHtmlId}>
      <Chessboard
        position={model.fen}
        boardWidth={boardWidth}
        onPieceDrop={(sourceSquare, targetSquare, _piece) => {

          const msg: Move = ['Move', {
            userId: currentUserId,
            from: sourceSquare,
            to: targetSquare,
            // promotion: 'q',
            promotion: 'q'

          }]

          dispatch(msg)

          return true
        }} />
    </UI.FillBox>
  </div>
}



export const theme = {
  lightSquare: "#EBEBD0",
  darkSquare: "#779455",
}


export const CoverArt = () => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 2 2"
    >
      <rect
        x={0}
        y={0}
        width={1}
        height={1}
        fill={theme.lightSquare}
      />

      <rect
        x={0}
        y={1}
        width={1}
        height={1}
        fill={theme.darkSquare}
      />

      <rect
        x={1}
        y={1}
        width={1}
        height={1}
        fill={theme.lightSquare}
      />

      <rect
        x={1}
        y={0}
        width={1}
        height={1}
        fill={theme.darkSquare}
      />
    </svg>
  )
}
