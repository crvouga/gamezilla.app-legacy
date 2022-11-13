import * as Auth from "../Auth/Auth"
import { Browser, Cmd, p, t } from "../Core"
import { PhoneNumber } from "../Data"
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
  code: string
  submission:
  | {
    type: "Idle"
  }
  | {
    type: "Loading"
  }
  | {
    type: "Problem"
    message: string
  }
  | {
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
  code: "",
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
  | ["ClickedVerifyCode"]
  | ["InputtedCode", string]
  | ["VerifyCode_Done", Auth.AuthResult]
  | ["Focus_Done", Browser.FocusResult]

const codeInputId = "codeInputId"

export const update = (
  { phoneNumber }: { phoneNumber: PhoneNumber },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "ClickedBack": {
      return [model, Route.back]
    }

    case "ClickedVerifyCode": {
      return [
        { code: model.code, submission: { type: "Loading" } },
        p(
          Auth.verifyCode({ code: model.code, phoneNumber }),
          Cmd.perform((result): Msg => ["VerifyCode_Done", result]),
        ),
      ]
    }

    case "InputtedCode": {
      return [{ ...model, code: msg[1] }, Cmd.None]
    }

    case "VerifyCode_Done": {
      const result = msg[1]

      if (result.type === "Err") {
        return [
          {
            code: "",
            submission: { type: "Problem", message: result.error.message },
          },
          p(Browser.focus(codeInputId), Cmd.perform(t("Focus_Done"))),
        ]
      }

      return [{ ...model, submission: { type: "Success" } }, Cmd.None]
    }

    case "Focus_Done": {
      return [model, Cmd.None]
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
  phoneNumber,
  model,
  dispatch,
}: {
  phoneNumber: PhoneNumber
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  return (
    <UI.FillBox>
      <UI.Header
        left={<UI.HeaderBackButton onClick={() => dispatch(["ClickedBack"])} />}
        title="Verify Code"
      />
      <UI.Box
        sx={{
          padding: 2,
        }}
      >
        <UI.TextField
          id={codeInputId}
          autoFocus
          sx={{ marginBottom: 2 }}
          type="tel"
          fullWidth
          inputMode="tel"
          label="Code"
          value={model.code}
          onChange={(event) => {
            dispatch(["InputtedCode", event.target.value])
          }}
          helperText={`The code was sent to ${PhoneNumber.toString(
            phoneNumber,
          )}`}
        />

        <UI.Button
          variant="contained"
          size="large"
          fullWidth
          loading={model.submission.type === "Loading"}
          onClick={() => dispatch(["ClickedVerifyCode"])}
        >
          Verify Code
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
