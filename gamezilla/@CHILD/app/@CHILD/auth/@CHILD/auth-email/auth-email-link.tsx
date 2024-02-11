import { Eff, Result, exhaustive, isErr } from "gamezilla/@SHARED/core"
import { RouteCmd } from "gamezilla/@CHILD/app/@SHARED/client"
import {
  AlertError,
  AlertSuccess,
  Button,
  TextField,
  TopBar,
  TopBarBackButton,
} from "gamezilla/@CHILD/app/@SHARED/ui"

//
//
//
// Model
//
//
//

export type Model = {
  emailAddress: string
  validation?: "invalid-email" | null
  submission:
    | { type: "idle" }
    | { type: "loading"; sentToEmailAddress: string }
    | { type: "problem"; message: string }
    | { type: "ok"; sentToEmailAddress: string }
}

export const init: Model = {
  emailAddress: "",
  submission: { type: "idle" },
}

//
//
//
// Update
//
//
//

export type Msg =
  | { t: "clicked-back" }
  | { t: "clicked-send-login-link" }
  | { t: "inputted-email-address"; emailAddress: string }
  | { t: "login-done"; result: Result<string, null> }

export const update = ({
  msg,
  model,
}: {
  msg: Msg
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
  msgCmd?: RouteCmd[]
} => {
  if (msg.t === "inputted-email-address") {
    return {
      model: {
        ...model,
        validation: null,
        emailAddress: msg.emailAddress,
      },
    }
  }

  if (msg.t === "login-done") {
    if (isErr(msg.result)) {
      return {
        model: {
          ...model,
          submission: {
            type: "problem",
            message: msg.result.error,
          },
        },
      }
    }

    const emailAddress =
      model.submission.type === "loading"
        ? model.submission.sentToEmailAddress
        : model.emailAddress

    return {
      model: {
        ...model,
        emailAddress: "",
        submission: { type: "ok", sentToEmailAddress: emailAddress },
      },
    }
  }

  if (msg.t === "clicked-send-login-link") {
    if (model.emailAddress.length === 0) {
      return {
        model: {
          ...model,
          validation: "invalid-email",
        },
      }
    }

    return {
      model: {
        ...model,
        submission: {
          type: "loading",
          sentToEmailAddress: model.emailAddress,
        },
      },
    }
  }

  if (msg.t === "clicked-back") {
    return {
      model: model,
      msgCmd: [{ t: "routing", c: { t: "back" } }],
    }
  }

  return exhaustive(msg)
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
    <div className="flex h-full w-full flex-col">
      <TopBar
        left={
          <TopBarBackButton onClick={() => dispatch({ t: "clicked-back" })} />
        }
        title="Login With Email"
      />

      <form
        className="flex flex-col gap-6 p-4"
        onSubmit={(e) => {
          e.preventDefault()
          dispatch({ t: "clicked-send-login-link" })
        }}
      >
        <TextField
          autoFocus
          id="email-address"
          type="email"
          label="Email Address"
          value={model.emailAddress}
          onChange={(emailAddress) => {
            dispatch({ t: "inputted-email-address", emailAddress })
          }}
          onClear={() =>
            dispatch({
              t: "inputted-email-address",
              emailAddress: "",
            })
          }
          error={model.validation === "invalid-email"}
          helperText={
            model.validation === "invalid-email"
              ? "Please enter a valid email address"
              : undefined
          }
        />

        <Button
          variant="contained"
          size="lg"
          className="w-full"
          color="primary"
          type="submit"
          loading={model.submission.type === "loading"}
          text="Send Login Link"
        />

        {model.submission.type === "problem" && (
          <AlertError>{model.submission.message}</AlertError>
        )}

        {model.submission.type === "ok" && (
          <AlertSuccess>
            <div className="flex flex-col gap-1">
              <div className="text-lg">Check your email</div>
              <div className="font-light">
                Login link was send to{" "}
                <span className="font-semibold text-white">
                  {model.submission.sentToEmailAddress}
                </span>
              </div>
            </div>
          </AlertSuccess>
        )}
      </form>
    </div>
  )
}
