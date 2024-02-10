import { MsgClient, ModelClient, initShared } from "./battleship.core"

export const init = initShared

export const View = (_props: {
    model: ModelClient
    dispatch: (msg: MsgClient) => void
}) => {
    return <div>battleship</div>
}
