import { Cmd, Uuid } from "@gamezilla/core"
import { BackendModel, BackendMsg, ToBackend } from "./auth.Type"

//
//
//
// Model
//
//
//

export type Model = BackendModel

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
}

export const updateFromFrontend = (
  msg: ToBackend,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "LoginWithCode": {
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
              phoneNumber: msg[1].phoneNumber,
            },
          },
        },
        Cmd.None
      ]
    }

    case "VerifyCode": {

      return [model, Cmd.None]
    }
  }
}

const generateRandomCode = () => {
  return Math.floor(Math.random() * 100_000)
}
