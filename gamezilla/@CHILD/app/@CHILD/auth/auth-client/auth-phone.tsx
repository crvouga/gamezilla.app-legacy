import {
  Browser,
  Eff,
  Iso3166Alpha2Code,
  PhoneNumber,
  Result,
  p,
} from "gamezilla/@SHARED/core";
import {
  AnonymousViewCtx,
  RouteCmd,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  Button,
  IconPhone,
  TextField,
  TopBar,
  TopBarBackButton,
} from "gamezilla/@CHILD/app/@SHARED/ui";

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

export const init: {
  model: Model;
  eff: Eff<Msg>;
} = {
  model: {
    country: "US",
    phoneNumber: "",
    countryQuery: Iso3166Alpha2Code.toName("US"),
    validation: "not-validated",
    submission: {
      type: "idle",
    },
  },
  eff: p(
    Browser.focus("phone-number"),
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
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
  cmd?: RouteCmd[];
} => {
  switch (msg.t) {
    case "clicked-send-code": {
      if (model.phoneNumber.length === 0) {
        return { model: { ...model, validation: "empty-phone-number" } };
      }

      const decoded = PhoneNumber.parse(model.country, model.phoneNumber);

      if (decoded.t === "err") {
        return { model: { ...model, validation: "invalid-phone-number" } };
      }

      const phoneNumber = decoded.value;

      return {
        model: { ...model, submission: { type: "loading" } },
        eff: async (dispatch) => {
          //
        },
      };
    }

    case "inputted-country": {
      return {
        model: {
          ...model,
          country: msg.country,
          countryQuery: Iso3166Alpha2Code.toName(msg.country),
          validation: "not-validated",
        },
      };
    }

    case "inputted-phone-number": {
      return {
        model: {
          ...model,
          phoneNumber: msg.phoneNumber,
          validation: "not-validated",
        },
      };
    }

    case "send-code-done": {
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
        cmd: [
          {
            t: "routing/push",
            route: {
              t: "auth",
              c: { t: "login-phone-verify", phoneNumber: phoneNumber },
            },
          },
        ],
      };
    }

    case "inputted-country-query": {
      return { model: { ...model, countryQuery: msg.value } };
    }

    default: {
      return { model };
    }
  }
};

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
  ctx,
}: {
  model: Model;
  dispatch: (msg: Msg) => void;
  ctx: AnonymousViewCtx;
}) => {
  return (
    <div className="w-full flex-1">
      <TopBar
        left={<TopBarBackButton onClick={ctx.back} />}
        title="Login With Phone"
      />

      <form
        className="flex flex-col gap-4 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          dispatch({ t: "clicked-send-code" });
        }}>
        <TextField
          id="phone-number"
          startIcon={
            <IconPhone className="mr-2 h-6 w-6 text-inherit opacity-80" />
          }
          label="Phone Number"
          onChange={(phoneNumber) => {
            dispatch({ t: "inputted-phone-number", phoneNumber });
          }}
          onClear={() =>
            dispatch({ t: "inputted-phone-number", phoneNumber: "" })
          }
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

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="lg"
          className="mt-2 w-full"
          loading={model.submission.type === "loading"}
          text="Send Code"
        />

        {model.submission.type === "Problem" && (
          <div className="mt-2 rounded-md bg-red-500 p-4 text-white">
            {model.submission.message}
          </div>
        )}
      </form>
    </div>
  );
};
