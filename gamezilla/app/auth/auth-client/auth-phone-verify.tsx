import {
  Browser,
  Eff,
  PhoneNumber,
  Result,
  Task,
  Time,
  p,
} from "gamezilla/@SHARED/core";
import { AnonymousViewCtx, RouteCmd } from "gamezilla/app/@SHARED/client";
import {
  AlertError,
  AlertSuccess,
  Button,
  MyTextField,
  TopBar,
  TopBarBackButton,
} from "gamezilla/app/@SHARED/ui";

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

export const init: { model: Model; eff: Eff<Msg> } = {
  model: {
    code: "",
    submission: { type: "idle" },
  },
  eff: p(
    Time.delay(100, () => null),
    Task.chain(() => Browser.focus(codeInputId)),
    Eff.perform((result) => ({ t: "focus-done", result }))
  ),
};

//
//
//
// Update
//
//
//

export type Msg =
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
  eff?: Eff<Msg>;
  cmd?: RouteCmd[];
  shouldLoadCurrentUser?: boolean;
} => {
  if (msg.t === "clicked-verify-code") {
    return {
      model: {
        code: model.code,
        submission: { type: "loading" },
      },
      eff: p(
        verifyCode({ code: model.code, phoneNumber }),
        Eff.perform((result): Msg => ({ t: "verify-code-done", result }))
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
  ctx,
  phoneNumber,
  model,
  dispatch,
}: {
  phoneNumber: PhoneNumber;
  model: Model;
  ctx: AnonymousViewCtx;
  dispatch: (msg: Msg) => void;
}) => {
  return (
    <div className="flex h-full w-full flex-col">
      <TopBar
        left={<TopBarBackButton onClick={ctx.back} />}
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
          autoFocus
          type="tel"
          label="Code"
          value={model.code}
          onChange={(code) => dispatch({ t: "inputted-code", code })}
          onClear={() => dispatch({ t: "inputted-code", code: "" })}
        />

        <Button
          variant="contained"
          size="lg"
          className="w-full"
          color="primary"
          onClick={() => dispatch({ t: "clicked-verify-code" })}
          loading={model.submission.type === "loading"}
          text="Verify Code"
        />

        {model.submission.type === "problem" && (
          <AlertError className="mt-4">{model.submission.message}</AlertError>
        )}
      </div>
    </div>
  );
};
