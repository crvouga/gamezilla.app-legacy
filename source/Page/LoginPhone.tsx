import * as Auth from "../Auth"
import { Cmd, exhaustive, pipe } from "../Core"
import * as Route from "../Route"
import { ISO_3166, PhoneNumber } from "../Data"
import * as UI from "../UI"

//
//
//
// Model
//
//
//

export type Model =
    {
        phoneNumber: string,
        country: ISO_3166.Iso3166Alpha2Code,
        validation: "NotChecked" | "InvalidPhoneNumber" | "EmptyPhoneNumber",
        submission: {
            type: "Idle"
        } | {
            type: "Loading"
        } | {
            type: "Problem",
            message: string
        } | {
            type: "Success"
        }
    }

//
//
//
// Init
//
//
//

export const init: Model = {
    country: "US",
    phoneNumber: "",
    validation: "NotChecked",
    submission: {
        type: "Idle"
    }
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
    | ["InputtedCountry", ISO_3166.Iso3166Alpha2Code]
    | ["SendCode_Done", PhoneNumber.PhoneNumber, Auth.AuthResult]


export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
    switch (msg[0]) {
        case 'ClickedBack': {
            return [model, Route.back]
        }

        case 'ClickedSendCode': {

            if (model.phoneNumber.length === 0) {
                return [{ ...model, validation: "EmptyPhoneNumber" }, Cmd.None]
            }

            const decoded = PhoneNumber.decode(model.country, model.phoneNumber)

            if (decoded.type === 'Err') {
                return [{ ...model, validation: "InvalidPhoneNumber" }, Cmd.None]
            }

            const phoneNumber = decoded.value

            return [
                { ...model, submission: { type: "Loading" } },
                pipe(
                    Auth.sendCode({ phoneNumber: phoneNumber }),
                    Cmd.perform((result): Msg => ['SendCode_Done', phoneNumber, result])
                )
            ]
        }

        case 'InputtedPhoneNumber': {
            return [{ ...model, phoneNumber: msg[1], validation: "NotChecked" }, Cmd.None]
        }


        case 'InputtedCountry': {
            return [{ ...model, country: msg[1], validation: "NotChecked" }, Cmd.None]
        }

        case 'SendCode_Done': {
            const phoneNumber = msg[1]
            const result = msg[2]

            if (result.type === 'Err') {
                return [{ ...model, submission: { type: "Problem", message: result.error.message } }, Cmd.None]
            }

            return [{ ...model, submission: { type: "Success" } }, Route.push(['LoginPhoneVerify', { phoneNumber: phoneNumber }])]
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
                <UI.Autocomplete
                    id="iso_3166_phone_number"
                    defaultValue={ISO_3166.of("US")}
                    options={ISO_3166.all}
                    getOptionLabel={(option) => `${ISO_3166.toEmoji(option)} ${ISO_3166.toName(option)}`}
                    renderInput={(params) => <UI.TextField {...params} fullWidth label="Country" sx={{ marginBottom: 2 }} />}
                    onChange={(_event, value) => {
                        if (value) {
                            dispatch(['InputtedCountry', value])
                        }
                    }}
                />

                <UI.TextField
                    autoFocus
                    sx={{ marginBottom: 2 }}
                    type="tel"
                    fullWidth
                    inputMode="tel"
                    label="Phone Number"
                    value={model.phoneNumber}
                    onChange={(event) => {
                        dispatch(["InputtedPhoneNumber", event.target.value])
                    }}
                    error={model.validation === 'InvalidPhoneNumber' || model.validation === 'EmptyPhoneNumber'}
                    helperText={model.validation === 'InvalidPhoneNumber' ? `Invalid phone number for ${ISO_3166.toName(model.country)}` : model.validation === 'EmptyPhoneNumber' ? "Phone number is required" : undefined}
                />

                <UI.Button
                    variant="contained"
                    size="large"
                    fullWidth
                    loading={model.submission.type === "Loading"}
                    onClick={() => dispatch(["ClickedSendCode"])}
                >
                    Send Code
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
        </UI.FillBox>
    )
}


// 4802098698