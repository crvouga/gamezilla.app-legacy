import {
  APP_SOUND,
  AnonymousViewCtx,
  ClientCmd,
  RouteAuth,
  focusView,
  playSound,
  pushRoute,
  sendToServer,
  showToast,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  AlertError,
  Button,
  Select,
  TextField,
  TopBar,
  TopBarBackButton,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import {
  Iso3166Alpha2Code,
  PhoneNumber,
  RemoteResult,
} from "gamezilla/@SHARED/core";
import { ClientModel, ClientMsg, ToClient, ToServer } from "./auth-sms.core";

export const init: ClientModel = {
  code: "",
  codeInput: "",
  phoneNumberInput: "",
  phoneNumberError: null,
  sendCode: { t: "not-asked" },
  verifyCode: { t: "not-asked" },
  countryCodeInput: Iso3166Alpha2Code.of("US"),
};

export const update = ({
  model,
  msg,
}: {
  model: ClientModel;
  msg: ClientMsg;
}): {
  model: ClientModel;
  cmd?: ClientCmd<ToServer>[];
  // cmd: RouteCmd<AuthRoute>;
} => {
  switch (msg.t) {
    case "inputted-phone-number": {
      return {
        model: {
          ...model,
          phoneNumberInput: msg.phoneNumber,
          phoneNumberError: null,
        },
      };
    }

    case "inputted-country-code": {
      return {
        model: {
          ...model,
          countryCodeInput: msg.countryCode,
        },
      };
    }

    case "clicked-send-code": {
      const phoneNumber = PhoneNumber.decode(
        model.countryCodeInput,
        model.phoneNumberInput
      );

      if (phoneNumber.t === "err") {
        return {
          model: {
            ...model,
            phoneNumberError: phoneNumber.error.userMessage,
          },
        };
      }

      return {
        model: { ...model, sendCode: RemoteResult.loading },
        cmd: [
          sendToServer({
            t: "send-code",
            phoneNumber: phoneNumber.value,
          }),
        ],
      };
    }

    case "inputted-code": {
      return {
        model: {
          ...model,
          codeInput: msg.code,
        },
      };
    }

    case "clicked-verify-code": {
      if (model.codeInput === "") {
        return {
          model: {
            ...model,
            verifyCode: {
              t: "err",
              error: "Code cannot be empty",
            },
          },
        };
      }
      return {
        model: {
          ...model,
          verifyCode: RemoteResult.loading,
        },
        cmd: [
          sendToServer({
            t: "verify-code",
            code: model.codeInput,
            phoneNumber: msg.phoneNumber,
          }),
        ],
      };
    }

    default: {
      return { model };
    }
  }
};

export const updateFromServer = ({
  msg,
  model,
}: {
  msg: ToClient;
  model: ClientModel;
}): {
  model: ClientModel;
  cmd?: ClientCmd<ToServer>[];
} => {
  switch (msg.t) {
    case "sent-code": {
      if (msg.result.t === "err") {
        return { model: { ...model, sendCode: msg.result } };
      }
      return {
        model: { ...model, sendCode: msg.result, codeInput: "" },
        cmd: [
          pushRoute({
            t: "auth",
            c: {
              t: "login-phone-verify",
              phoneNumber: msg.phoneNumber,
            },
          }),
          showToast(
            `Sent code to ${PhoneNumber.toString(msg.phoneNumber)}`,
            "info",
            4000
          ),
          focusView("codeInput"),
          playSound(APP_SOUND.navForwardMin),
        ],
      };
    }

    case "verified-code": {
      if (msg.result.t === "err") {
        return { model: { ...model, verifyCode: msg.result } };
      }
      return {
        model: { ...model, verifyCode: msg.result },
        cmd: [playSound(APP_SOUND.navForward)],
      };
    }
  }
};

export const View = ({
  route,
  model,
  dispatch,
  ctx,
}: {
  ctx: AnonymousViewCtx;
  route: RouteAuth;
  model: ClientModel;
  dispatch: (m: ClientMsg) => void;
}) => {
  switch (route.t) {
    case "login-phone": {
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
              onChange={(countryCodeNew) => {
                dispatch({
                  t: "inputted-country-code",
                  countryCode: countryCodeNew,
                });
              }}
              value={model.countryCodeInput}
              options={Iso3166Alpha2Code.all}
              toKey={(countryCode) => countryCode}
              toName={(countryCode) =>
                Iso3166Alpha2Code.toNameWithEmoji(countryCode)
              }
            />

            <TextField
              value={model.phoneNumberInput}
              id="phoneNumberInput"
              label="Phone Number"
              type="tel"
              error={typeof model.phoneNumberError === "string"}
              helperText={model.phoneNumberError}
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
            <div className="w-full p-4">
              <AlertError>{model.sendCode.error}</AlertError>
            </div>
          )}
        </div>
      );
    }

    case "login-phone-verify": {
      return (
        <div className="w-full">
          <TopBar
            left={<TopBarBackButton onClick={() => ctx.back()} />}
            title="Login with phone"
          />

          <div className="flex w-full flex-col gap-6 p-4 py-6">
            <TextField
              value={model.codeInput}
              id="codeInput"
              label="Code"
              autoFocus
              type="tel"
              onChange={(value) => {
                dispatch({ t: "inputted-code", code: value });
              }}
            />
            <Button
              className="w-full"
              text="Verify Code"
              color="primary"
              loading={model.verifyCode.t === "loading"}
              onClick={() => {
                dispatch({
                  t: "clicked-verify-code",
                  phoneNumber: route.phoneNumber,
                });
              }}
            />
          </div>

          {model.verifyCode.t === "err" && (
            <div className="w-full p-4">
              <AlertError>{model.verifyCode.error}</AlertError>
            </div>
          )}
        </div>
      );
    }

    default: {
      return null;
    }
  }
};
