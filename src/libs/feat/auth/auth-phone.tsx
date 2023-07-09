import { Iso3166Alpha2Code, PhoneNumber } from "@gamezilla/shared/app";
import { ClientAppMsg, UnauthenticatedViewCtx } from "@gamezilla/shared/client";
import {
  Browser,
  Cmd,
  Result,
  Task,
  matchSort,
  p,
} from "@gamezilla/shared/core";
import {
  Autocomplete,
  IconPhone,
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
  phoneNumber: string;
  country: Iso3166Alpha2Code;
  countryQuery: string;
  validation:
    | "not-validated"
    | "invalid-phone-number"
    | "empty-phone-number"
    | "invalid-timezone";
  submission:
    | { type: "idle" }
    | { type: "loading" }
    | { type: "Problem"; message: string }
    | { type: "ok" };
};

export const init = (): {
  model: Model;
  cmd: Cmd<Msg>;
} => {
  return {
    model: {
      country: "US",
      phoneNumber: "",
      countryQuery: Iso3166Alpha2Code.toName("US"),
      validation: "not-validated",
      submission: {
        type: "idle",
      },
    },
    cmd: p(
      Browser.focus("phone-number"),
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
  | { t: "clicked-send-code" }
  | { t: "inputted-phone-number"; phoneNumber: string }
  | {
      t: "send-code-done";
      phoneNumber: PhoneNumber;
      result: Result<string, null>;
    }
  | { t: "inputted-country"; country: Iso3166Alpha2Code }
  | { t: "inputted-country-query"; value: string }
  | { t: "focus-done"; result: Browser.FocusResult };

export const update = ({
  msg,
  model,
  sendCode,
}: {
  msg: Msg;
  model: Model;
  sendCode: (input: { phoneNumber: PhoneNumber }) => Task<Result<string, null>>;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: ClientAppMsg[];
} => {
  if (msg.t === "clicked-send-code") {
    if (model.phoneNumber.length === 0) {
      return { model: { ...model, validation: "empty-phone-number" } };
    }

    const decoded = PhoneNumber.decode(model.country, model.phoneNumber);

    if (decoded.t === "err") {
      return { model: { ...model, validation: "invalid-phone-number" } };
    }

    const phoneNumber = decoded.value;

    return {
      model: { ...model, submission: { type: "loading" } },
      cmd: p(
        sendCode({ phoneNumber: phoneNumber }),
        Cmd.perform(
          (result): Msg => ({ t: "send-code-done", phoneNumber, result })
        )
      ),
    };
  }

  if (msg.t === "inputted-country") {
    return {
      model: {
        ...model,
        country: msg.country,
        countryQuery: Iso3166Alpha2Code.toName(msg.country),
        validation: "not-validated",
      },
    };
  }

  if (msg.t === "inputted-phone-number") {
    return {
      model: {
        ...model,
        phoneNumber: msg.phoneNumber,
        validation: "not-validated",
      },
    };
  }

  if (msg.t === "send-code-done") {
    const { phoneNumber, result } = msg;

    if (result.t === "err") {
      return {
        model: {
          ...model,
          submission: { type: "Problem", message: result.error },
        },
      };
    }

    return {
      model: { ...model, submission: { type: "ok" } },
      msgs: [
        {
          t: "push-route",
          route: {
            t: "auth",
            c: { t: "login-phone-verify", phoneNumber: phoneNumber },
          },
        },
      ],
    };
  }

  if (msg.t === "inputted-country-query") {
    return { model: { ...model, countryQuery: msg.value } };
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

const allOptions = Iso3166Alpha2Code.all.map((country) => ({
  value: country,
  name: Iso3166Alpha2Code.toName(country),
}));

export const View = ({
  model,
  $send,
  ctx,
}: {
  model: Model;
  $send: (msg: Msg) => void;
  ctx: UnauthenticatedViewCtx;
}) => {
  const filteredOptions = matchSort(
    allOptions,
    (x) => x.name,
    model.countryQuery
  ).map((option) => option.value);
  return (
    <div className="w-full flex-1">
      <TopBar
        left={<TopBarBackButton onClick={ctx.$back} />}
        title="Login With Phone"
      />

      <form
        className="flex flex-col gap-4 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          $send({ t: "clicked-send-code" });
        }}>
        <Autocomplete
          label="Country"
          startIcon={
            <span className="ml-2" role="img" aria-describedby="flag">
              {Iso3166Alpha2Code.toEmoji(model.country)}
            </span>
          }
          value={model.country}
          onChange={(country) => $send({ t: "inputted-country", country })}
          onClear={() => $send({ t: "inputted-country-query", value: "" })}
          options={filteredOptions}
          onChangeQuery={(value) =>
            $send({ t: "inputted-country-query", value })
          }
          toKey={(x) => x}
          toLabel={(x) => Iso3166Alpha2Code.toNameWithEmoji(x)}
          valueQuery={model.countryQuery}
          className="w-full"
        />

        <MyTextField
          id="phone-number"
          startIcon={
            <IconPhone className="mr-2 h-6 w-6 text-inherit opacity-80" />
          }
          label="Phone Number"
          onChange={(phoneNumber) =>
            $send({
              t: "inputted-phone-number",
              phoneNumber: phoneNumber.replace(/\D/g, ""),
            })
          }
          onClear={() => $send({ t: "inputted-phone-number", phoneNumber: "" })}
          type="tel"
          value={model.phoneNumber.replace(/\D/g, "")}
          error={
            model.validation === "invalid-phone-number" ||
            model.validation === "empty-phone-number"
          }
          helperText={
            model.validation === "invalid-phone-number"
              ? "Invalid phone number"
              : model.validation === "empty-phone-number"
              ? "Phone number is required"
              : undefined
          }
        />

        <MyButton
          type="submit"
          variant="contained"
          color="primary"
          size="lg"
          className="mt-2 w-full">
          {model.submission.type === "loading" && (
            <IconSpinner className="h-6 w-6 animate-spin" />
          )}
          Send Code
        </MyButton>

        {model.submission.type === "Problem" && (
          <div className="mt-2 rounded-md bg-red-500 p-4 text-white">
            {model.submission.message}
          </div>
        )}
      </form>
    </div>
  );
};
