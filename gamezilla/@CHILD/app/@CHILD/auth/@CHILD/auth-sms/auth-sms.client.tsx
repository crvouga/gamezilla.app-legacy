import {
  AnonymousViewCtx,
  Location,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  AlertError,
  Button,
  MyTextField,
  Select,
  TopBar,
  TopBarBackButton,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { toLocation, toRoute } from "./route";
import { ClientModel, ClientMsg } from "./auth-sms.core";
import { Iso3166Alpha2Code } from "gamezilla/@SHARED/core";

export const init: ClientModel = {
  code: "",
  codeInput: "",
  phoneNumberInput: "",
  sendCode: { t: "not-asked" },
  verifyCode: { t: "not-asked" },
};

export const update = ({
  model,
  msg,
}: {
  model: ClientModel;
  msg: ClientMsg;
}): {
  model: ClientModel;
  // cmd: RouteCmd<AuthRoute>;
} => {
  switch (msg.t) {
    case "inputted-phone-number": {
      return {
        model: {
          ...model,
          phoneNumberInput: msg.phoneNumber,
        },
      };
    }
    default: {
      return { model };
    }
  }
};

export const View = ({
  location,
  model,
  dispatch,
  ctx,
}: {
  ctx: AnonymousViewCtx;
  location: Location;
  model: ClientModel;
  dispatch: (m: ClientMsg) => void;
}) => {
  const route = toRoute(location);

  switch (route.t) {
    case "/": {
      return (
        <div className="w-full">
          <TopBar
            left={<TopBarBackButton onClick={() => ctx.back()} />}
            title="Login with phone"
          />

          <div className="flex w-full flex-col gap-6 p-4 py-6">
            <Select
              id="countryCode"
              label="Country"
              onChange={() => {
                //
              }}
              options={Iso3166Alpha2Code.all}
              toKey={(countryCode) => countryCode}
              toName={(countryCode) =>
                Iso3166Alpha2Code.toNameWithEmoji(countryCode)
              }
            />

            <MyTextField
              value={model.phoneNumberInput}
              id="phoneNumberInput"
              label="Phone Number"
              onChange={(value) => {
                dispatch({ t: "inputted-phone-number", phoneNumber: value });
              }}
            />

            <div className="w-full pt-1"></div>

            <Button
              text="Send Code"
              className="w-full"
              variant="contained"
              color="primary"
              loading={model.sendCode.t === "loading"}
              onClick={() => {
                dispatch({ t: "clicked-send-code" });
              }}
            />
          </div>

          {model.sendCode.t === "err" && (
            <AlertError>{model.sendCode.error}</AlertError>
          )}
        </div>
      );
    }

    case "/verify": {
      return (
        <div className="w-full">
          <TopBar
            left={<TopBarBackButton onClick={() => {}} />}
            title="Login with phone"
          />

          <div className="w-full">
            <MyTextField
              value={model.phoneNumberInput}
              id="phoneNumberInput"
              label="Phone Number"
              onChange={(value) => {
                dispatch({ t: "inputted-phone-number", phoneNumber: value });
              }}
            />
            <Button
              text="Verify Code"
              loading={model.verifyCode.t === "loading"}
              onClick={() => {
                dispatch({ t: "clicked-send-code" });
              }}
            />
          </div>

          {model.verifyCode.t === "err" && (
            <AlertError>{model.verifyCode.error}</AlertError>
          )}
        </div>
      );
    }
  }
};
