import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Sub, Cmd, Browser, pipe, Result, tag } from "../../../Core";
import * as UI from "../../../UI";
import { FrontendModel, FrontendMsg, initSharedModel, ToFrontend } from "./Chess.Types";

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

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
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

    case 'Move': {
      return [model, Cmd.None]
    }
  }
}

export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd.Cmd<Msg>] => {
  return [model, Cmd.None]
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
// View
//
//
//

const containerHtmlId = "chess"

export const view =
  (model: Model): UI.View<Msg> =>
    (dispatch) =>
      <View model={model} dispatch={dispatch} />


export const View = ({ model, dispatch }: { model: Model, dispatch: (msg: Msg) => void }) => {
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
      <Chessboard boardWidth={boardWidth} />
    </UI.FillBox>
  </div>
}
