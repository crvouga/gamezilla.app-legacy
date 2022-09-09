import * as Auth from "../Auth"
import { Cmd, exhaustive, pipe } from "../Core"
import * as Route from "../Route"
import * as UI from "../UI"

//
//
//
// Model
//
//
//

export type Model =
    | {
        type: "Idle"
        phoneNumber: string
    }
    | {
        type: "Loading"
        phoneNumber: string
    }
    | {
        type: "Problem"
        problem: string
        phoneNumber: string
    }
    | {
        type: "Success"
        phoneNumber: string
    }

//
//
//
// Init
//
//
//

export const init: Model = {
    type: "Idle",
    phoneNumber: "",
}

//
//
//
// Update
//
//
//

export type Msg =
    | ["ClickedBack"]
    | ["ClickedSendCode"]
    | ["InputtedPhoneNumber", string]
    | ["SendCode_Done", Auth.AuthResult]


export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'ClickedBack': {
            return [model, Route.back]
        }

        case 'ClickedSendCode': {
            return [
                { type: "Loading", phoneNumber: model.phoneNumber },
                pipe(
                    Auth.sendCode({ phoneNumber: model.phoneNumber }),
                    Cmd.perform((result): Msg => ['SendCode_Done', result])
                )
            ]
        }

        case 'InputtedPhoneNumber': {
            return [{ ...model, phoneNumber: msg[1] }, Cmd.None]
        }

        case 'SendCode_Done': {
            const result = msg[1]
            switch (result.type) {
                case 'Err': {
                    return [{ type: "Problem", phoneNumber: model.phoneNumber, problem: result.error.message }, Cmd.None]
                }

                case 'Ok': {
                    return [{ type: "Success", phoneNumber: model.phoneNumber }, Route.push(['LoginPhoneVerify', { phoneNumber: model.phoneNumber }])]
                }
            }
        }


    }
}

//
//
//
// View
//
//
//

export const View = ({
    model,
    dispatch,
}: {
    model: Model
    dispatch: (msg: Msg) => void
}) => {

    return (
        <UI.FillBox>
            <UI.Header
                left={
                    <UI.HeaderBackButton onClick={() => dispatch(["ClickedBack"])} />
                }
                title="Login With Phone"
            />
            <UI.Box
                sx={{
                    padding: 2,
                }}
            >
                <UI.TextField
                    autoFocus
                    sx={{ marginBottom: 2 }}
                    type="email"
                    fullWidth
                    inputMode="tel"
                    label="Phone Number"
                    value={model.phoneNumber}
                    onChange={(event) => {
                        dispatch(["InputtedPhoneNumber", event.target.value])
                    }}
                />

                <UI.Button
                    variant="contained"
                    size="large"
                    fullWidth
                    loading={model.type === "Loading"}
                    onClick={() => dispatch(["ClickedSendCode"])}
                >
                    Send Code
                </UI.Button>

                {model.type === "Problem" && (
                    <UI.Alert
                        severity="error"
                        sx={{ marginTop: 2 }}
                    >
                        {model.problem}
                    </UI.Alert>
                )}
            </UI.Box>
        </UI.FillBox>
    )
}


// 4802098698