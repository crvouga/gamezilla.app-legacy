import { AppClientModule } from "gamezilla-app/app/@shared/architecture/app-client"
import {
  APP_SOUND,
  BaseClientCtx,
  ClientEvent,
} from "gamezilla-app/app/@shared/client"
import {
  ClientCmd,
  focusView,
  playSound,
  pushRoute,
  replaceRoute,
  sendToServer,
  showToast,
} from "gamezilla-app/app/@shared/client/client-cmd"
import {
  AlertError,
  Button,
  IconMobilePhone,
  Select,
  TextField,
  TopBar,
  TopBarBackButton,
} from "gamezilla-app/app/@shared/ui"
import {
  Err,
  Iso3166Alpha2Code,
  PhoneNumber,
  Posix,
  RemoteResult,
  Sub,
  Time,
  TimeSpan,
  Uuid,
  isErr,
} from "gamezilla-app/@shared/core"
import {
  ModelClient,
  MsgClient,
  MsgToClient,
  MsgToServer,
} from "./auth-sms.core"
import { verifyCodeProblemToString } from "./verify-sms/verify-sms"

//
//
//
//
//
//
//

type Module = AppClientModule<{
  Model: ModelClient
  Msg: MsgClient
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Ctx: BaseClientCtx
  MsgInCmd: null
  MsgInEvent: ClientEvent
  MsgOutCmd: ClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>
  MsgOutEvent: ClientEvent
}>

//
//
//
//
//
//
//

export const init: Module["init"] = () => {
  return {
    model: {
      codeInput: "",
      codeError: null,
      //
      phoneNumberInput: "",
      countryCodeInput:
        Iso3166Alpha2Code.getNavigatorCountry() ?? Iso3166Alpha2Code.of("US"),
      phoneNumberError: null,
      //

      sentCodeAt: null,
      sendCode: RemoteResult.notAsked,

      verifiedCodeAt: null,
      verifyCode: RemoteResult.notAsked,
    },
  }
}

//
//
//
//
//
//
//

const CODE_INPUT_VIEW_ID = "codeInput"

const PHONE_NUMBER_INPUT_VIEW_ID = "phoneNumberInput"

//
//
//
//
//
//
//

export const update: Module["update"] = (input) => {
  if (input.msg) {
    return updateFromMsg(input)
  }
  if (input.msgServer) {
    return updateFromServer(input)
  }
  return { model: input.model }
}

const updateFromMsg: Module["update"] = (input) => {
  if (!input.msg) {
    return { model: input.model }
  }

  const { ctx, model, msg } = input

  switch (msg.t) {
    case "clicked-back-button": {
      if (ctx.currentRoute.t === "login-sms-verify") {
        return {
          model,
          msgCmd: [
            replaceRoute({
              n: "auth-login",
              t: "login-sms-request",
            }),
          ],
        }
      }

      return {
        model,
        msgCmd: [
          replaceRoute({
            n: "auth-login",
            t: "login",
          }),
        ],
      }
    }

    case "inputted-phone-number": {
      return {
        model: {
          ...model,
          phoneNumberInput: msg.phoneNumber,
          phoneNumberError: null,
        },
      }
    }

    case "clicked-phone-number-clear": {
      return {
        model: {
          ...model,
          phoneNumberInput: "",
          phoneNumberError: null,
        },
      }
    }

    case "inputted-country-code": {
      return {
        model: { ...model, countryCodeInput: msg.countryCode },
      }
    }

    case "clicked-send-code": {
      const phoneNumber = PhoneNumber.fromString(model.phoneNumberInput)

      if (isErr(phoneNumber)) {
        return {
          model: {
            ...model,
            phoneNumberError: ctx.t("auth-sms.invalid-phone-number"),
          },
          msgCmd: [
            playSound(APP_SOUND.alertErrorSm),
            focusView(PHONE_NUMBER_INPUT_VIEW_ID),
          ],
        }
      }

      return {
        model: {
          ...model,
          sendCode: RemoteResult.loading,
          sentCodeAt: ctx.now,
        },
        msgCmd: [
          sendToServer({
            t: "send-code",
            phoneNumber: phoneNumber.value,
          }),
          playSound(APP_SOUND.tap),
        ],
      }
    }

    case "inputted-code": {
      return {
        model: { ...model, codeInput: msg.code, codeError: null },
      }
    }

    case "clicked-code-clear": {
      return {
        model: { ...model, codeInput: "", codeError: null },
      }
    }

    case "clicked-verify-code": {
      if (model.codeInput === "") {
        return {
          model: {
            ...model,
            codeError: "Please enter the code",
          },
          msgCmd: [
            playSound(APP_SOUND.alertErrorSm),
            focusView(CODE_INPUT_VIEW_ID),
          ],
        }
      }

      const verificationId =
        model.sendCode.t === "ok" ? model.sendCode.value.verificationId : null

      if (!verificationId) {
        return {
          model: {
            ...model,
            verifyCode: Err({
              t: "verification-not-found",
            }),
          },
          msgCmd: [playSound(APP_SOUND.alertErrorMd)],
        }
      }

      return {
        model: {
          ...model,
          verifiedCodeAt: ctx.now,
          verifyCode: RemoteResult.loading,
        },
        msgCmd: [
          playSound(APP_SOUND.tap),
          sendToServer({
            t: "verify-code",
            code: model.codeInput,
            verificationId,
          }),
        ],
      }
    }

    case "time-passed": {
      return AppClientModule.andThen(
        { model },
        (model) => {
          if (
            model.sentCodeAt &&
            model.sendCode.t === "loading" &&
            TimeSpan.gte(
              Posix.diff(ctx.now, model.sentCodeAt),
              TimeSpan.fromSeconds(5),
            )
          ) {
            return {
              model: {
                ...model,
                sendCode: RemoteResult.err(
                  "Timed out. Server took too long to response",
                ),
              },
              msgCmd: [playSound(APP_SOUND.alertErrorMd)],
            }
          }
          return { model }
        },
        (model) => {
          if (
            model.verifiedCodeAt &&
            model.verifyCode.t === "loading" &&
            TimeSpan.gte(
              Posix.diff(ctx.now, model.verifiedCodeAt),
              TimeSpan.fromSeconds(10),
            )
          ) {
            return {
              model: {
                ...model,
                verifyCode: RemoteResult.err({
                  t: "database-error",
                  error: "Timed out. Server took too long to response",
                }),
              },
              msgCmd: [playSound(APP_SOUND.alertErrorMd)],
            }
          }

          return { model }
        },
      )
    }
  }
}

const updateFromServer: Module["update"] = (input) => {
  if (!input.msgServer) {
    return { model: input.model }
  }

  const { model, msgServer } = input

  switch (msgServer.t) {
    case "sent-code": {
      if (isErr(msgServer.result)) {
        return {
          model: { ...model, sendCode: msgServer.result },
          msgCmd: [playSound(APP_SOUND.alertErrorMd)],
        }
      }

      return {
        model: {
          ...model,
          sendCode: msgServer.result,
          verifyCode: RemoteResult.notAsked,
          codeInput: "",
        },
        msgCmd: [
          pushRoute({
            n: "auth-login",
            t: "login-sms-verify",
            phoneNumber: msgServer.phoneNumber,
          }),
          showToast(
            `Sent code to ${PhoneNumber.toString(msgServer.phoneNumber)}`,
            "info",
            TimeSpan.fromSeconds(4),
          ),
          focusView(CODE_INPUT_VIEW_ID),
          playSound(APP_SOUND.navForwardMin),
        ],
      }
    }

    case "verified-code": {
      if (isErr(msgServer.result)) {
        return {
          model: { ...model, verifyCode: msgServer.result },
          msgCmd: [playSound(APP_SOUND.alertErrorMd)],
        }
      }
      return {
        model: {
          ...model,
          verifyCode: msgServer.result,
        },
      }
    }
  }
}

//
//
//
//
//
//
//

const INTERVAL_ID = Uuid.generate()

export const subscriptions: Module["subscriptions"] = (input) => {
  if (
    input.model.sendCode.t === "loading" ||
    input.model.verifyCode.t === "loading"
  ) {
    return Time.interval(
      INTERVAL_ID,
      TimeSpan.fromMilliseconds(1000),
      (now) => ({
        t: "time-passed",
        now,
      }),
    )
  }

  return Sub.None
}

//
//
//
//
//
//
//
//
//

export const View: Module["View"] = (props) => {
  switch (props.ctx.currentRoute.n) {
    case "auth-login": {
      switch (props.ctx.currentRoute.t) {
        case "login-sms-request": {
          return (
            <div className="w-full flex-1">
              <TopBar
                left={
                  <TopBarBackButton
                    onClick={() => props.dispatch({ t: "clicked-back-button" })}
                  />
                }
                title={props.ctx.t("auth-sms.login-with-phone")}
              />

              <div className="flex w-full flex-col gap-6 p-4 py-6">
                {false && (
                  <Select
                    id="countryCode"
                    label={props.ctx.t("auth-sms.country")}
                    onChange={(countryCodeNew) => {
                      props.dispatch({
                        t: "inputted-country-code",
                        countryCode: countryCodeNew,
                      })
                    }}
                    value={props.model.countryCodeInput}
                    options={Iso3166Alpha2Code.all}
                    toKey={(countryCode) => countryCode}
                    toName={(countryCode) =>
                      Iso3166Alpha2Code.toNameWithEmoji(countryCode)
                    }
                  />
                )}

                <TextField
                  value={props.model.phoneNumberInput}
                  id="phoneNumberInput"
                  label={props.ctx.t("auth-sms.phone-number")}
                  type="tel"
                  startIcon={<IconMobilePhone className="h-5 w-5" />}
                  error={typeof props.model.phoneNumberError === "string"}
                  helperText={props.model.phoneNumberError}
                  onChange={(value) => {
                    props.dispatch({
                      t: "inputted-phone-number",
                      phoneNumber: value,
                    })
                  }}
                  onClear={() => {
                    props.dispatch({ t: "clicked-phone-number-clear" })
                  }}
                />

                <Button
                  text={props.ctx.t("auth-sms.send-code")}
                  className="w-full"
                  variant="contained"
                  color="primary"
                  size="lg"
                  loading={props.model.sendCode.t === "loading"}
                  onClick={() => {
                    props.dispatch({ t: "clicked-send-code" })
                  }}
                />
              </div>

              {isErr(props.model.sendCode) && (
                <div className="w-full p-4">
                  <AlertError>{props.model.sendCode.error}</AlertError>
                </div>
              )}
            </div>
          )
        }
        case "login-sms-verify": {
          const phoneNumber = props.ctx.currentRoute.phoneNumber
          return (
            <div className="w-full flex-1">
              <TopBar
                left={
                  <TopBarBackButton
                    onClick={() => props.dispatch({ t: "clicked-back-button" })}
                  />
                }
                title={props.ctx.t("auth-sms.login-with-phone")}
              />

              <div className="flex w-full flex-col gap-6 p-4 py-6">
                <TextField
                  value={props.model.codeInput}
                  id={CODE_INPUT_VIEW_ID}
                  label={props.ctx.t("auth-sms.code")}
                  error={typeof props.model.codeError === "string"}
                  helperText={
                    typeof props.model.codeError === "string"
                      ? props.model.codeError
                      : null
                  }
                  autoFocus
                  type="tel"
                  onChange={(value) => {
                    props.dispatch({ t: "inputted-code", code: value })
                  }}
                  onClear={() => {
                    props.dispatch({ t: "clicked-code-clear" })
                  }}
                />
                <Button
                  className="w-full"
                  text={props.ctx.t("auth-sms.verify-code")}
                  color="primary"
                  size="lg"
                  loading={
                    props.model.verifyCode.t === "loading" ||
                    props.model.verifyCode.t === "ok"
                  }
                  onClick={() => {
                    props.dispatch({
                      t: "clicked-verify-code",
                      phoneNumber,
                    })
                  }}
                />
              </div>

              {isErr(props.model.verifyCode) && (
                <div className="w-full p-4">
                  <AlertError>
                    {verifyCodeProblemToString({
                      problem: props.model.verifyCode.error,
                      t: props.ctx.t,
                    })}
                  </AlertError>
                </div>
              )}
            </div>
          )
        }
        default: {
          return null
        }
      }
    }
    default: {
      return null
    }
  }
}
