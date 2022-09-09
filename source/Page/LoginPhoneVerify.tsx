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
        code: string
    }
    | {
        type: "Loading"
        code: string
    }
    | {
        type: "Problem"
        problem: string
        code: string
    }
    | {
        type: "Success"
        code: string
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
    code: "",
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
    | ["ClickedVerifyCode"]
    | ["InputtedCode", string]
    | ["VerifyCode_Done", Auth.AuthResult]


export const update = ({ phoneNumber }: { phoneNumber: string }, msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'ClickedBack': {
            return [model, Route.back]
        }

        case 'ClickedVerifyCode': {
            return [
                { type: "Loading", code: model.code },
                pipe(
                    Auth.verifyCode({ code: model.code, phoneNumber, }),
                    Cmd.perform((result): Msg => ['VerifyCode_Done', result])
                )
            ]
        }

        case 'InputtedCode': {
            return [{ ...model, code: msg[1] }, Cmd.None]
        }

        case 'VerifyCode_Done': {
            return [{ ...model, }, Cmd.None]
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
                title="Verify Code"
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
                    label="Code"
                    value={model.code}
                    onChange={(event) => {
                        dispatch(["InputtedCode", event.target.value])
                    }}
                />

                <UI.Button
                    variant="contained"
                    size="large"
                    fullWidth
                    loading={model.type === "Loading"}
                    onClick={() => dispatch(["ClickedVerifyCode"])}
                >
                    Verify Code
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