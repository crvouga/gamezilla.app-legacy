import { PhoneNumber } from "@gamezilla/shared/app";
import { ClientAppMsg } from "@gamezilla/shared/client";
import { Browser, Cmd, Result, Task, Time, Unit, p } from "@gamezilla/core";
import {
  AlertError,
  AlertSuccess,
  IconSpinner,
  MyButton,
  MyTextField,
  TopBar,
  TopBarBackButton,
} from "@gamezilla/shared/ui";

//
//
//
// Model
//
//
//

export type Model = {
  code: string;
  submission:
    | {
        type: "idle";
      }
    | {
        type: "loading";
      }
    | {
        type: "problem";
        message: string;
      }
    | {
        type: "ok";
      };
};

const codeInputId = "codeInputId";

export const init = (): { model: Model; cmd: Cmd<Msg> } => {
  return {
    model: {
      code: "",
      submission: { type: "idle" },
    },
    cmd: p(
      Time.delay(100, () => Unit),
      Task.chain(() => Browser.focus(codeInputId)),
      Cmd.perform((result) => ({ t: "focus-done", result }))
    ),
  };
};

//
//
//
// Update
//
//
//

export type Msg =
  | { t: "clicked-back" }
  | { t: "clicked-verify-code" }
  | { t: "inputted-code"; code: string }
  | { t: "verify-code-done"; result: Result<string, null> }
  | { t: "focus-done"; result: Browser.FocusResult };

export const update = ({
  phoneNumber,
  msg,
  model,
  verifyCode,
}: {
  phoneNumber: PhoneNumber;
  msg: Msg;
  model: Model;
  verifyCode: (input: {
    code: string;
    phoneNumber: PhoneNumber;
  }) => Task<Result<string, null>>;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: ClientAppMsg[];
  shouldLoadCurrentUser?: boolean;
} => {
  if (msg.t === "clicked-back") {
    return { model, msgs: [{ t: "route-back" }] };
  }

  if (msg.t === "clicked-verify-code") {
    return {
      model: {
        code: model.code,
        submission: { type: "loading" },
      },
      cmd: p(
        verifyCode({ code: model.code, phoneNumber }),
        Cmd.perform((result): Msg => ({ t: "verify-code-done", result }))
      ),
    };
  }

  if (msg.t === "inputted-code") {
    return { model: { ...model, code: msg.code } };
  }

  if (msg.t === "verify-code-done") {
    const result = msg.result;

    if (result.t === "ok") {
      return {
        model: {
          code: model.code,
          submission: { type: "ok" },
        },
        shouldLoadCurrentUser: true,
      };
    }

    return {
      model: {
        code: model.code,
        submission: { type: "problem", message: result.error },
      },
    };
  }

  if (msg.t === "focus-done") {
    return { model };
  }

  return { model };
};

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
  phoneNumber: PhoneNumber;
  model: Model;
  dispatch: (msg: Msg) => void;
}) => {
  return (
    <div className="flex h-full w-full flex-col">
      <TopBar
        left={
          <TopBarBackButton onClick={() => dispatch({ t: "clicked-back" })} />
        }
        title="Verify Code"
      />
      <div className="flex w-full flex-col gap-4 p-4">
        <AlertSuccess>
          <p className="flex flex-wrap items-center gap-1 font-light">
            The code was sent to
            <span className="inline-block font-semibold">
              {PhoneNumber.format(phoneNumber)}.
            </span>
          </p>
        </AlertSuccess>

        <MyTextField
          id={codeInputId}
          startIcon
          autoFocus
          type="tel"
          label="Code"
          value={model.code}
          onChange={(code) => dispatch({ t: "inputted-code", code })}
          onClear={() => dispatch({ t: "inputted-code", code: "" })}
        />

        <MyButton
          variant="contained"
          size="lg"
          className="w-full"
          color="primary"
          onClick={() => dispatch({ t: "clicked-verify-code" })}>
          {model.submission.type === "loading" && (
            <IconSpinner className="h-6 w-6 animate-spin" />
          )}
          Verify Code
        </MyButton>

        {model.submission.type === "problem" && (
          <AlertError className="mt-4">{model.submission.message}</AlertError>
        )}
      </div>
    </div>
  );
};
