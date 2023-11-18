import {
  APP_SOUND,
  AnonymousViewCtx,
  ClientCmd,
  ClientEvt,
  RouteAuth,
  cancelTimeout,
  focusView,
  playSound,
  pushRoute,
  sendToServer,
  showToast,
  startTimeout,
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
  Eff,
  Iso3166Alpha2Code,
  PhoneNumber,
  RemoteResult,
  Time,
} from "gamezilla/@SHARED/core";
import { ClientModel, ClientMsg, ToClient, ToServer } from "./auth-sms.core";

export const init: ClientModel = {
  codeInput: "",
  codeError: null,
  //
  phoneNumberInput: "",
  countryCodeInput: Iso3166Alpha2Code.of("US"),
  phoneNumberError: null,
  //
  loggingIn: false,
  timeoutId: null,
  sendCode: RemoteResult.notAsked,
  verifyCode: RemoteResult.notAsked,
};

export const update = ({
  model,
  msg,
}: {
  model: ClientModel;
  msg: ClientMsg;
}): {
  model: ClientModel;
  cmd?: ClientCmd<{
    ToServer: ToServer;
    ClientMsg: ClientMsg;
  }>[];
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
      const phoneNumber = PhoneNumber.parse(model.phoneNumberInput);

      if (phoneNumber.t === "err") {
        return {
          model: {
            ...model,
            phoneNumberError: phoneNumber.error.userMessage,
          },
        };
      }

      return {
        model: {
          ...model,
          sendCode: RemoteResult.loading,
        },

        cmd: [
          sendToServer({
            t: "send-code",
            phoneNumber: phoneNumber.value,
          }),
          startTimeout("send-code", 5_000, { t: "send-code-timed-out" }),
        ],
      };
    }

    case "send-code-timed-out": {
      return {
        model: {
          ...model,
          sendCode: RemoteResult.err("Timed out"),
        },
      };
    }

    case "inputted-code": {
      return {
        model: {
          ...model,
          codeInput: msg.code,
          codeError: null,
        },
      };
    }

    case "clicked-verify-code": {
      if (model.codeInput === "") {
        return {
          model: {
            ...model,
            codeError: "Please enter the code",
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
          startTimeout("verify-code", 5_000, { t: "verify-code-timed-out" }),
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
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
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
          cancelTimeout("send-code"),
        ],
      };
    }

    case "verified-code": {
      if (msg.result.t === "err") {
        return { model: { ...model, verifyCode: msg.result } };
      }
      return {
        model: {
          ...model,
          verifyCode: msg.result,
          loggingIn: true,
        },
        cmd: [cancelTimeout("verify-code")],
      };
    }
  }
};

export const updateFromEvent = ({
  model,
  msg,
}: {
  model: ClientModel;
  msg: ClientEvt;
}): {
  model: ClientModel;
} => {
  switch (msg.t) {
    case "client-authenticated": {
      return {
        model: {
          ...model,
          loggingIn: false,
        },
      };
    }

    default: {
      return {
        model,
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
        <div class="w-full">
          <TopBar
            left={<TopBarBackButton onClick={() => ctx.back()} />}
            title="Login with phone"
          />

          <div class="flex w-full flex-col gap-6 p-4 py-6">
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

            <Button
              text="Send Code"
              class="w-full"
              variant="contained"
              color="primary"
              size="lg"
              loading={model.sendCode.t === "loading"}
              onClick={() => {
                dispatch({ t: "clicked-send-code" });
              }}
            />
          </div>

          {model.sendCode.t === "err" && (
            <div class="w-full p-4">
              <AlertError>{model.sendCode.error}</AlertError>
            </div>
          )}
        </div>
      );
    }

    case "login-phone-verify": {
      return (
        <div class="w-full">
          <TopBar
            left={<TopBarBackButton onClick={() => ctx.back()} />}
            title="Login with phone"
          />

          <div class="flex w-full flex-col gap-6 p-4 py-6">
            <TextField
              value={model.codeInput}
              id="codeInput"
              label="Code"
              error={typeof model.codeError === "string"}
              helperText={
                typeof model.codeError === "string" ? model.codeError : null
              }
              autoFocus
              type="tel"
              onChange={(value) => {
                dispatch({ t: "inputted-code", code: value });
              }}
            />
            <Button
              class="w-full"
              text="Verify Code"
              color="primary"
              size="lg"
              loading={model.verifyCode.t === "loading" || model.loggingIn}
              onClick={() => {
                dispatch({
                  t: "clicked-verify-code",
                  phoneNumber: route.phoneNumber,
                });
              }}
            />
          </div>

          {model.verifyCode.t === "err" && (
            <div class="w-full p-4">
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
