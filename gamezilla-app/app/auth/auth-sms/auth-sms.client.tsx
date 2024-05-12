import {
	Iso3166Alpha2Code,
	NotAsked,
	PhoneNumber,
	Posix,
	RemoteResult,
	Sub,
	Time,
	TimeSpan,
	Uuid,
	isErr,
} from "gamezilla-app/@/core";
import {
	AppClientModule,
	andThen,
} from "gamezilla-app/app/@/architecture/app-client";
import {
	APP_SOUND,
	type BaseClientCtx,
	type ClientEvent,
} from "gamezilla-app/app/@/client";
import {
	focusView,
	playSound,
	pushRoute,
	replaceRoute,
	sendToServer,
	showToast,
	type ClientCmd,
} from "gamezilla-app/app/@/client/client-cmd";
import {
	AlertError,
	Button,
	IconMobilePhone,
	Select,
	TextField,
	TopBar,
	TopBarBackButton,
} from "gamezilla-app/app/@/ui";
import type {
	ModelClient,
	MsgClient,
	MsgToClient,
	MsgToServer,
} from "./auth-sms.types";
import {
	sendCodeProblemToString,
	verifyCodeProblemToString,
} from "./verify-sms/verify-sms";

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
	MsgCmdIn: null;
	MsgEvtIn: ClientEvent;
	MsgCmdOut: ClientCmd<{
		MsgClient: MsgClient;
		MsgToServer: MsgToServer;
	}>;
	MsgEvtOut: ClientEvent;
}>;

//
//
//
//
//
//
//

const init: Module["init"] = () => {
	return {
		model: {
			inputtedCode: "",
			inputtedCodeError: null,
			//
			inputtedPhoneNumber: "",
			countryCodeInput:
				Iso3166Alpha2Code.getNavigatorCountry() ?? Iso3166Alpha2Code.of("US"),
			phoneNumberError: null,
			//

			sentCodeAt: null,
			sendCode: NotAsked,

			verifiedCodeAt: null,
			verifyCode: RemoteResult.NotAsked,
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

const update: Module["update"] = (input) => {
	return andThen(
		{ model: input.model },
		(model) => updateFromMsg({ ...input, model }),
		(model) => updateFromServer({ ...input, model }),
	);
};

const updateFromMsg: Module["update"] = (input) => {
	const { ctx, model, msg } = input;

	switch (msg?.t) {
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
					inputtedPhoneNumber: msg.phoneNumber,
					phoneNumberError: null,
				},
			};
		}

		case "clicked-phone-number-clear": {
			return {
				model: {
					...model,
					inputtedPhoneNumber: "",
					phoneNumberError: null,
				},
			};
		}

		case "inputted-country-code": {
			return {
				model: { ...model, countryCodeInput: msg.countryCode },
			};
		}

		case "user-clicked-send-code-button": {
			const phoneNumber = PhoneNumber.fromString(model.inputtedPhoneNumber);

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
					sendCode: RemoteResult.Loading,
					sentCodeAt: ctx.now,
				},
				msgCmd: [
					sendToServer({
						t: "user-clicked-send-code-button",
						phoneNumber: phoneNumber.value,
						perferredLanguage: ctx.navigatorLanguage,
					}),
					playSound(APP_SOUND.tap),
				],
			};
		}

		case "inputted-code": {
			return {
				model: {
					...model,
					inputtedCode: msg.inputtedCode,
					inputtedCodeError: null,
				},
			};
		}

		case "clicked-code-clear": {
			return {
				model: { ...model, inputtedCode: "", inputtedCodeError: null },
			};
		}

		case "user-clicked-verify-code-button": {
			if (model.inputtedCode === "") {
				return {
					model: {
						...model,
						inputtedCodeError: "Please enter the code",
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
					verifyCode: RemoteResult.Loading,
				},
				msgCmd: [
					playSound(APP_SOUND.tap),
					sendToServer({
						t: "user-clicked-verify-code-button",
						inputtedCode: model.inputtedCode,
						verificationId: msg.verificationId,
					}),
				],
			};
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
							TimeSpan.seconds(5),
						)
					) {
						return {
							model: {
								...model,
								sendCode: RemoteResult.Err({
									t: "database-error",
									error: ctx.t("app.something-went-wrong"),
								}),
							},
							msgCmd: [playSound(APP_SOUND.alertErrorMd)],
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
							TimeSpan.seconds(10),
						)
					) {
						return {
							model: {
								...model,
								verifyCode: RemoteResult.Err({
									t: "database-error",
									error: "Timed out. Server took too long to response",
								}),
							},
							msgCmd: [playSound(APP_SOUND.alertErrorMd)],
						};
					}

					return { model };
				},
			);
		}

		default: {
			return { model };
		}
	}
};

const updateFromServer: Module["update"] = (input) => {
	const { model, msgServer } = input;

	switch (msgServer?.t) {
		case "sent-code": {
			if (isErr(msgServer.sent)) {
				return {
					model: { ...model, sendCode: msgServer.sent },
					msgCmd: [playSound(APP_SOUND.alertErrorMd)],
				};
			}

			return {
				model: {
					...model,
					sendCode: msgServer.sent,
					verifyCode: RemoteResult.NotAsked,
					inputtedCode: "",
				},
				msgCmd: [
					pushRoute({
						n: "auth-login",
						t: "login-sms-verify",
						verificationId: msgServer.sent.value.verificationId,
					}),
					showToast(
						`Sent code to ${PhoneNumber.format(msgServer.phoneNumber)}`,
						"info",
						TimeSpan.seconds(4),
					),
					focusView(CODE_INPUT_VIEW_ID),
					playSound(APP_SOUND.navForwardMin),
				],
			};
		}

		case "verified-code": {
			if (isErr(msgServer.verified)) {
				return {
					model: { ...model, verifyCode: msgServer.verified },
					msgCmd: [playSound(APP_SOUND.alertErrorMd)],
				};
			}
			return {
				model: {
					...model,
					verifyCode: msgServer.verified,
				},
			};
		}

		default: {
			return { model };
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

const subscriptions: Module["subscriptions"] = (input) => {
	if (
		input.model.sendCode.t === "loading" ||
		input.model.verifyCode.t === "loading"
	) {
		return Time.interval(INTERVAL_ID, TimeSpan.milliseconds(1000), (now) => ({
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

const View: Module["View"] = (props) => {
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
											});
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
									value={props.model.inputtedPhoneNumber}
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
										});
									}}
									onClear={() => {
										props.dispatch({ t: "clicked-phone-number-clear" });
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
										props.dispatch({ t: "user-clicked-send-code-button" });
									}}
								/>
							</div>

							{isErr(props.model.sendCode) && (
								<div className="w-full p-4">
									<AlertError
										text={sendCodeProblemToString({
											problem: props.model.sendCode.error,
											t: props.ctx.t,
										})}
									/>
								</div>
							)}
						</div>
					);
				}
				case "login-sms-verify": {
					const verificationId = props.ctx.currentRoute.verificationId;
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
									value={props.model.inputtedCode}
									id={CODE_INPUT_VIEW_ID}
									label={props.ctx.t("auth-sms.code")}
									error={typeof props.model.inputtedCodeError === "string"}
									helperText={
										typeof props.model.inputtedCodeError === "string"
											? props.model.inputtedCodeError
											: null
									}
									autoFocus
									type="tel"
									onChange={(value) => {
										props.dispatch({ t: "inputted-code", inputtedCode: value });
									}}
									onClear={() => {
										props.dispatch({ t: "clicked-code-clear" });
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
											t: "user-clicked-verify-code-button",
											verificationId,
											inputtedCode: props.model.inputtedCode,
										});
									}}
								/>
							</div>

							{isErr(props.model.verifyCode) && (
								<div className="w-full p-4">
									<AlertError
										text={verifyCodeProblemToString({
											problem: props.model.verifyCode.error,
											t: props.ctx.t,
										})}
									/>
								</div>
							)}
						</div>
					);
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

export const AuthSMSClient = {
	init,
	update,
	subscriptions,
	View,
};
