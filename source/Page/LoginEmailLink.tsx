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

export type Model = {
    emailAddress: string
    submission:
    | { type: "Idle" }
    | { type: "Loading"; sentToEmailAddress: string }
    | { type: "Problem"; message: string }
    | { type: "Success"; sentToEmailAddress: string }
}

//
//
//
// Init
//
//
//

export const init: Model = {
    emailAddress: "",
    submission: { type: "Idle" },
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
    | ["ClickedSendLoginLink"]
    | ["InputtedEmailAddress", string]
    | ["Login_Done", Auth.LoginResult]
    | ["DismissedSuccessModal"]

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case "InputtedEmailAddress":
            return [{ ...model, emailAddress: msg[1] }, Cmd.None]

        case "Login_Done": {
            switch (msg[1].type) {
                case "Err": {
                    return [
                        {
                            ...model,
                            submission: {
                                type: "Problem",
                                message: msg[1].error.message,
                            },
                        },
                        Cmd.None,
                    ]
                }

                case "Ok": {
                    const emailAddress =
                        model.submission.type === "Loading"
                            ? model.submission.sentToEmailAddress
                            : model.emailAddress
                    return [
                        {
                            ...model,
                            submission: { type: "Success", sentToEmailAddress: emailAddress },
                        },
                        Cmd.None,
                    ]
                }
            }
        }

        case "ClickedSendLoginLink": {
            return [
                {
                    ...model,
                    submission: {
                        type: "Loading",
                        sentToEmailAddress: model.emailAddress,
                    },
                },
                pipe(
                    Auth.loginWithEmailLink({ emailAddress: model.emailAddress }),
                    Cmd.perform((result): Msg => ["Login_Done", result]),
                ),
            ]
        }

        case 'DismissedSuccessModal': {
            return [{ ...model, submission: { type: "Idle" } }, Cmd.None]
        }

        case "ClickedBack": {
            return [model, Route.back]
        }

        default:
            return exhaustive(msg[0])
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
                left={<UI.HeaderBackButton onClick={() => dispatch(["ClickedBack"])} />}
                title="Login With Email"
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
                    inputMode="email"
                    label="Email Address"
                    value={model.emailAddress}
                    onChange={(event) => {
                        dispatch(["InputtedEmailAddress", event.target.value])
                    }}
                />

                <UI.Button
                    variant="contained"
                    size="large"
                    fullWidth
                    loading={model.submission.type === "Loading"}
                    onClick={() => dispatch(["ClickedSendLoginLink"])}
                >
                    Send Login Link
                </UI.Button>

                {model.submission.type === "Problem" && (
                    <UI.Alert
                        severity="error"
                        sx={{ marginTop: 2 }}
                    >
                        {model.submission.message}
                    </UI.Alert>
                )}
            </UI.Box>

            <UI.Dialog open={model.submission.type === "Success"} onClose={() => dispatch(['DismissedSuccessModal'])}>
                <UI.DialogTitle>Check your email!</UI.DialogTitle>
                <UI.DialogContent>
                    <UI.Typography
                        color="text.secondary"
                        variant="body2"
                    >
                        An email was sent to{" "}
                        <UI.Box
                            component="span"
                            sx={{ color: "text.primary" }}
                        >
                            {model.submission.type === "Success"
                                ? model.submission.sentToEmailAddress
                                : "the provider email address"}
                        </UI.Box>
                        . It has a link that will log you in.
                    </UI.Typography>
                </UI.DialogContent>
                <UI.DialogActions>
                    <UI.Button onClick={() => dispatch(['DismissedSuccessModal'])}>Ok</UI.Button>
                </UI.DialogActions>
            </UI.Dialog>
        </UI.FillBox>
    )
}
