import { AppClientModule } from "gamezilla-app/@CHILD/app/@SHARED/architecture/app-client";
import { APP_SOUND, BaseClientCtx, ClientEvent, } from "gamezilla-app/@CHILD/app/@SHARED/client";
import { ClientCmd, focusView, playSound, pushRoute, replaceRoute, sendToServer, showToast, } from "gamezilla-app/@CHILD/app/@SHARED/client/client-cmd";
import { AlertError, Button, IconMobilePhone, Select, TextField, TopBar, TopBarBackButton, } from "gamezilla-app/@CHILD/app/@SHARED/ui";
import { Iso3166Alpha2Code, PhoneNumber, Posix, RemoteResult, Sub, Time, TimeSpan, Uuid, isErr, } from "gamezilla-app/@SHARED/core";
import { ModelClient, MsgClient, MsgToClient, MsgToServer, } from "./auth-sms.core";
//
//
//
//
//
//
//
type Module = AppClientModule<{
    Model: ModelClient;
    Msg: MsgClient;
    MsgToClient: MsgToClient;
    MsgToServer: MsgToServer;
    Ctx: BaseClientCtx;
    MsgInCmd: null;
    MsgInEvent: ClientEvent;
    MsgOutCmd: ClientCmd<{
        MsgClient: MsgClient;
        MsgToServer: MsgToServer;
    }>;
    MsgOutEvent: ClientEvent;
}>;
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
            countryCodeInput: Iso3166Alpha2Code.getNavigatorCountry() ?? Iso3166Alpha2Code.of("US"),
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
const PHONE_NUMBER_INPUT_VIEW_ID = "phoneNumberInput";
//
//
//
//
//
//
//
export const update: Module["update"] = (input) => {
    if (input.msg) {
        return updateFromMsg(input);
    }
    if (input.msgServer) {
        return updateFromServer(input);
    }
    return { model: input.model };
};
const updateFromMsg: Module["update"] = (input) => {
    if (!input.msg) {
        return { model: input.model };
    }
    const { ctx, model, msg } = input;
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
                };
            }
            return {
                model,
                msgCmd: [
                    replaceRoute({
                        n: "auth-login",
                        t: "login",
                    }),
                ],
            };
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
                model: {
                    ...model,
                    phoneNumberInput: "",
                    phoneNumberError: null,
                },
            };
        }
        case "inputted-country-code": {
            return {
                model: { ...model, countryCodeInput: msg.countryCode },
            };
        }
        case "clicked-send-code": {
            const phoneNumber = PhoneNumber.parse(model.phoneNumberInput);
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
                };
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
            };
        }
        case "inputted-code": {
            return {
                model: { ...model, codeInput: msg.code, codeError: null },
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
                    msgCmd: [
                        playSound(APP_SOUND.alertErrorSm),
                        focusView(CODE_INPUT_VIEW_ID),
                    ],
                };
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
                        phoneNumber: msg.phoneNumber,
                    }),
                ],
            };
        }
        case "time-passed": {
            return AppClientModule.andThen({ model }, (model) => {
                if (model.sentCodeAt &&
                    model.sendCode.t === "loading" &&
                    TimeSpan.gte(Posix.diff(ctx.now, model.sentCodeAt), TimeSpan.fromSeconds(5))) {
                    return {
                        model: {
                            ...model,
                            sendCode: RemoteResult.err("Timed out. Server took too long to response"),
                        },
                        msgCmd: [playSound(APP_SOUND.alertErrorMd)],
                    };
                }
                return { model };
            }, (model) => {
                if (model.verifiedCodeAt &&
                    model.verifyCode.t === "loading" &&
                    TimeSpan.gte(Posix.diff(ctx.now, model.verifiedCodeAt), TimeSpan.fromSeconds(5))) {
                    return {
                        model: {
                            ...model,
                            verifyCode: RemoteResult.err("Timed out. Server took too long to response"),
                        },
                        msgCmd: [playSound(APP_SOUND.alertErrorMd)],
                    };
                }
                return { model };
            });
        }
    }
};
const updateFromServer: Module["update"] = (input) => {
    if (!input.msgServer) {
        return { model: input.model };
    }
    const { model, msgServer } = input;
    switch (msgServer.t) {
        case "sent-code": {
            if (isErr(msgServer.result)) {
                return {
                    model: { ...model, sendCode: msgServer.result },
                    msgCmd: [playSound(APP_SOUND.alertErrorMd)],
                };
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
                    showToast(`Sent code to ${PhoneNumber.toString(msgServer.phoneNumber)}`, "info", TimeSpan.fromSeconds(4)),
                    focusView(CODE_INPUT_VIEW_ID),
                    playSound(APP_SOUND.navForwardMin),
                ],
            };
        }
        case "verified-code": {
            if (isErr(msgServer.result)) {
                return {
                    model: { ...model, verifyCode: msgServer.result },
                    msgCmd: [playSound(APP_SOUND.alertErrorMd)],
                };
            }
            return {
                model: {
                    ...model,
                    verifyCode: msgServer.result,
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
const INTERVAL_ID = Uuid.generate();
export const subscriptions: Module["subscriptions"] = ({ model }) => {
    if (model.sendCode.t === "loading" || model.verifyCode.t === "loading") {
        return Time.interval(INTERVAL_ID, TimeSpan.fromMilliseconds(1000), (now) => ({
            t: "time-passed",
            now,
        }));
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
export const View: Module["View"] = ({ model, dispatch, ctx }) => {
    switch (ctx.currentRoute.n) {
        case "auth-login": {
            switch (ctx.currentRoute.t) {
                case "login-sms-request": {
                    return (<div className="w-full flex-1">
              <TopBar left={<TopBarBackButton onClick={() => dispatch({ t: "clicked-back-button" })}/>} title={ctx.t("auth-sms.login-with-phone")}/>

              <div className="flex w-full flex-col gap-6 p-4 py-6">
                {false && (<Select id="countryCode" label={ctx.t("auth-sms.country")} onChange={(countryCodeNew) => {
                                dispatch({
                                    t: "inputted-country-code",
                                    countryCode: countryCodeNew,
                                });
                            }} value={model.countryCodeInput} options={Iso3166Alpha2Code.all} toKey={(countryCode) => countryCode} toName={(countryCode) => Iso3166Alpha2Code.toNameWithEmoji(countryCode)}/>)}

                <TextField value={model.phoneNumberInput} id="phoneNumberInput" label={ctx.t("auth-sms.phone-number")} type="tel" startIcon={<IconMobilePhone className="h-5 w-5"/>} error={typeof model.phoneNumberError === "string"} helperText={model.phoneNumberError} onChange={(value) => {
                            dispatch({
                                t: "inputted-phone-number",
                                phoneNumber: value,
                            });
                        }} onClear={() => {
                            dispatch({ t: "clicked-phone-number-clear" });
                        }}/>

                <Button text={ctx.t("auth-sms.send-code")} className="w-full" variant="contained" color="primary" size="lg" loading={model.sendCode.t === "loading"} onClick={() => {
                            dispatch({ t: "clicked-send-code" });
                        }}/>
              </div>

              {isErr(model.sendCode) && (<div className="w-full p-4">
                  <AlertError>{model.sendCode.error}</AlertError>
                </div>)}
            </div>);
                }
                case "login-sms-verify": {
                    const phoneNumber = ctx.currentRoute.phoneNumber;
                    return (<div className="w-full flex-1">
              <TopBar left={<TopBarBackButton onClick={() => dispatch({ t: "clicked-back-button" })}/>} title={ctx.t("auth-sms.login-with-phone")}/>

              <div className="flex w-full flex-col gap-6 p-4 py-6">
                <TextField value={model.codeInput} id={CODE_INPUT_VIEW_ID} label={ctx.t("auth-sms.code")} error={typeof model.codeError === "string"} helperText={typeof model.codeError === "string" ? model.codeError : null} autoFocus type="tel" onChange={(value) => {
                            dispatch({ t: "inputted-code", code: value });
                        }} onClear={() => {
                            dispatch({ t: "clicked-code-clear" });
                        }}/>
                <Button className="w-full" text={ctx.t("auth-sms.verify-code")} color="primary" size="lg" loading={model.verifyCode.t === "loading" ||
                            model.verifyCode.t === "ok"} onClick={() => {
                            dispatch({
                                t: "clicked-verify-code",
                                phoneNumber,
                            });
                        }}/>
              </div>

              {isErr(model.verifyCode) && (<div className="w-full p-4">
                  <AlertError>{model.verifyCode.error}</AlertError>
                </div>)}
            </div>);
                }
                default: {
                    return null;
                }
            }
        }
        default: {
            return null;
        }
    }
};
