import { Cmd, p, Uuid } from "../Core";
import { SMS } from "../SMS/SMS";
import { BackendModel, BackendMsg, ToBackend, ToFrontend } from "./Auth.Type";

//
//
//
// Model
//
//
//

export type Model = BackendModel;

export const init: Model = { sessions: {}, verifications: {} }

//
//
//
// Update
//
//
//

export type Msg = BackendMsg

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case "LoginCodeSent": {
            return [model, Cmd.None]
        }
    }
};


export const updateFromFrontend = ({ sendToClient, SMS }: { sendToClient: (msg: ToFrontend) => Cmd<never>, SMS: SMS }, msg: ToBackend, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case 'LoginWithCode': {
            const code = generateRandomCode()
            const requestId = Uuid.generateSync()
            return [
                {
                    ...model,
                    verifications: {
                        ...model.verifications,
                        [requestId]: {
                            code,
                            requestId,
                            phoneNumber: msg[1].phoneNumber
                        }
                    }
                },
                p(
                    SMS.send({ to: msg[1].phoneNumber, message: toCodeMessage(code) }),
                    Cmd.perform((result) => result),
                    Cmd.chain(result => sendToClient(['LoginWithCode_Done', result]))
                )
            ]
        }

        case 'VerifyCode': {
            // const verification = Object.values(model.verifications).filter(verification =>
            //     PhoneNumber.eq(verification.phoneNumber, msg[1].phoneNumber)
            // )[0]

            return [model, Cmd.None]
        }
    }
}

const toCodeMessage = (code: number) => {
    return `Your Gamezilla login code is ${code}`
}

const generateRandomCode = () => {
    return Math.floor(Math.random() * 100_000)
}

