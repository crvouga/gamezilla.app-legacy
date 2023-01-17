import { Program } from "@gamezilla/core"
import { init, subscriptions, update } from "./app"

//
//
//
// Main
//
//
//


const program = Program.create({
    init: init(),
    subscriptions,
    update,
})

Program.run(program)

program.state$.subscribe((state) => {
    const msg = state.msg?.flat(Infinity)
    const msgType = msg?.reduce<string | null>(
        (msgType, subMsgType) =>
            typeof subMsgType === "string"
                ? msgType
                    ? `${msgType}.${subMsgType}`
                    : subMsgType
                : msgType,
        null,
    )
    if (msgType) {
        console.log(msgType)
    }
})
