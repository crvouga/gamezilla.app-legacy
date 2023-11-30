import { AppClient } from "gamezilla/@CHILD/app/@SHARED/architecture";
import {
  APP_SOUND,
  AnonymousClientCtx,
  AnonymousViewCtx,
  RouteAuth,
  focusView,
  playSound,
  pushRoute,
  replaceRoute,
  sendToServer,
  showToast,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  AlertError,
  Button,
  IconMobilePhone,
  Select,
  TextField,
  TopBar,
  TopBarBackButton,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import {
  Iso3166Alpha2Code,
  PhoneNumber,
  Posix,
  RemoteResult,
  Sub,
  Time,
  TimeSpan,
  chain,
  isErr,
} from "gamezilla/@SHARED/core";
import { ClientModel, ClientMsg, ToClient, ToServer } from "./auth-sms.core";

//
//
//
//
//
//
//

type Client = AppClient<{
  ClientModel: ClientModel;
  ClientMsg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  ClientCtx: AnonymousClientCtx;
  ViewCtx: AnonymousViewCtx & { route: RouteAuth };
  Cmd: never;
}>;

//
//
//
//
//
//
//

export const init: Client["init"] = () => {
  return {
    model: {
      codeInput: "",
      codeError: null,
      //
      phoneNumberInput: "",
      countryCodeInput: Iso3166Alpha2Code.of("US"),
      phoneNumberError: null,
      //

      sentCodeAt: null,
      sendCode: RemoteResult.notAsked,

      verifiedCodeAt: null,
      verifyCode: RemoteResult.notAsked,
    },
  };
};

//
//
//
//
//
//
//

const CODE_INPUT_VIEW_ID = "codeInput";

const focusCodeInput = focusView(CODE_INPUT_VIEW_ID);

const PHONE_NUMBER_INPUT_VIEW_ID = "phoneNumberInput";

const focusPhoneNumberInput = focusView(PHONE_NUMBER_INPUT_VIEW_ID);

//
//
//
//
//
//
//

export const update: Client["update"] = (input) => {
  return AppClient.chain(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromServer({ ...input, model })
  );
};

const updateFromMsg: Client["update"] = (input) => {
  const { model, msg, ctx } = input;

  if (msg.variant !== "msg") {
    return { model };
  }

  switch (msg.t) {
    case "clicked-back-button": {
      if (
        ctx.currentRoute.t === "auth" &&
        ctx.currentRoute.c.t === "login-phone-verify"
      ) {
        return {
          model,
          msg: [
            replaceRoute({
              t: "auth",
              c: { t: "login-phone", isSelectingCountry: false },
            }),
          ],
        };
      }

      return { model, msg: [replaceRoute({ t: "auth", c: { t: "login" } })] };
    }

    case "inputted-phone-number": {
      return {
        model: {
          ...model,
          phoneNumberInput: msg.phoneNumber,
          phoneNumberError: null,
        },
      };
    }

    case "clicked-phone-number-clear": {
      return {
        model: { ...model, phoneNumberInput: "", phoneNumberError: null },
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

      if (isErr(phoneNumber)) {
        return {
          model: {
            ...model,
            phoneNumberError: phoneNumber.error.userMessage,
          },
          msg: [playSound(APP_SOUND.alertErrorSm), focusPhoneNumberInput],
        };
      }

      return {
        model: {
          ...model,
          sendCode: RemoteResult.loading,
          sentCodeAt: ctx.now,
        },
        msg: [
          sendToServer({
            t: "send-code",
            phoneNumber: phoneNumber.value,
          }),
          playSound(APP_SOUND.tap),
        ],
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

    case "clicked-code-clear": {
      return {
        model: { ...model, codeInput: "", codeError: null },
      };
    }

    case "clicked-verify-code": {
      if (model.codeInput === "") {
        return {
          model: {
            ...model,
            codeError: "Please enter the code",
          },
          msg: [playSound(APP_SOUND.alertErrorSm), focusCodeInput],
        };
      }

      return {
        model: {
          ...model,
          verifiedCodeAt: ctx.now,
          verifyCode: RemoteResult.loading,
        },
        msg: [
          playSound(APP_SOUND.tap),
          sendToServer({
            t: "verify-code",
            code: model.codeInput,
            phoneNumber: msg.phoneNumber,
          }),
        ],
      };
    }

    case "time-passed": {
      return chain(
        { model },
        (model) => {
          if (
            model.sentCodeAt &&
            model.sendCode.t === "loading" &&
            TimeSpan.gte(
              Posix.diff(ctx.now, model.sentCodeAt),
              TimeSpan.fromSeconds(5)
            )
          ) {
            return {
              model: {
                ...model,
                sendCode: RemoteResult.err(
                  "Timed out. Server took too long to response"
                ),
              },
              msg: [playSound(APP_SOUND.alertErrorMd)],
            };
          }
          return { model };
        },
        (model) => {
          if (
            model.verifiedCodeAt &&
            model.verifyCode.t === "loading" &&
            TimeSpan.gte(
              Posix.diff(ctx.now, model.verifiedCodeAt),
              TimeSpan.fromSeconds(5)
            )
          ) {
            return {
              model: {
                ...model,
                verifyCode: RemoteResult.err(
                  "Timed out. Server took too long to response"
                ),
              },
              msg: [playSound(APP_SOUND.alertErrorMd)],
            };
          }

          return { model };
        }
      );
    }
  }
};

const updateFromServer: Client["update"] = ({ msg, model }) => {
  if (msg.variant !== "from-server") {
    return { model };
  }

  switch (msg.t) {
    case "sent-code": {
      if (isErr(msg.result)) {
        return {
          model: { ...model, sendCode: msg.result },
          msg: [playSound(APP_SOUND.alertErrorMd)],
        };
      }
      return {
        model: {
          ...model,
          sendCode: msg.result,
          verifyCode: RemoteResult.notAsked,
          codeInput: "",
        },
        msg: [
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
            TimeSpan.fromSeconds(4)
          ),
          focusCodeInput,
          playSound(APP_SOUND.navForwardMin),
        ],
      };
    }

    case "verified-code": {
      if (isErr(msg.result)) {
        return {
          model: { ...model, verifyCode: msg.result },
          msg: [playSound(APP_SOUND.alertErrorMd)],
        };
      }
      return {
        model: {
          ...model,
          verifyCode: msg.result,
        },
      };
    }
  }
};

//
//
//
//
//
//
//

export const subscriptions: Client["subscriptions"] = ({
  intervalId,
  model,
}) => {
  if (model.sendCode.t === "loading" || model.verifyCode.t === "loading") {
    return Time.interval(
      intervalId,
      TimeSpan.fromMilliseconds(1000),
      (now) => ({
        t: "time-passed",
        now,
      })
    );
  }

  return Sub.None;
};

//
//
//
//
//
//
//
//
//

export const View: Client["View"] = ({ model, dispatch, ctx }) => {
  const { route } = ctx;
  switch (route.t) {
    case "login-phone": {
      return (
        <div class="w-full flex-1">
          <TopBar
            left={
              <TopBarBackButton
                onClick={() => dispatch({ t: "clicked-back-button" })}
              />
            }
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
              startIcon={<IconMobilePhone class="h-5 w-5" />}
              error={typeof model.phoneNumberError === "string"}
              helperText={model.phoneNumberError}
              onChange={(value) => {
                dispatch({ t: "inputted-phone-number", phoneNumber: value });
              }}
              onClear={() => {
                dispatch({ t: "clicked-phone-number-clear" });
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

          {isErr(model.sendCode) && (
            <div class="w-full p-4">
              <AlertError>{model.sendCode.error}</AlertError>
            </div>
          )}
        </div>
      );
    }

    case "login-phone-verify": {
      return (
        <div class="w-full flex-1">
          <TopBar
            left={
              <TopBarBackButton
                onClick={() => dispatch({ t: "clicked-back-button" })}
              />
            }
            title="Login with phone"
          />

          <div class="flex w-full flex-col gap-6 p-4 py-6">
            <TextField
              value={model.codeInput}
              id={CODE_INPUT_VIEW_ID}
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
              onClear={() => {
                dispatch({ t: "clicked-code-clear" });
              }}
            />
            <Button
              class="w-full"
              text="Verify Code"
              color="primary"
              size="lg"
              loading={
                model.verifyCode.t === "loading" || model.verifyCode.t === "ok"
              }
              onClick={() => {
                dispatch({
                  t: "clicked-verify-code",
                  phoneNumber: route.phoneNumber,
                });
              }}
            />
          </div>

          {isErr(model.verifyCode) && (
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
