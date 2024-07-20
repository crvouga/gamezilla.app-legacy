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
	Text,
	TextField,
	TopBar,
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
			countryCodeInput: Iso3166Alpha2Code.of("US"),
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
		(model) => updateAutoFocus({ ...input, model }),
	);
};

const updateAutoFocus: Module["update"] = (input) => {
	switch (input.msgEvt?.t) {
		case "routing/route-changed": {
			switch (input.msgEvt.route.t) {
				case "login-sms-request": {
					return {
						model: input.model,
						msgCmd: [focusView(PHONE_NUMBER_INPUT_VIEW_ID)],
					};
				}

				case "login-sms-verify": {
					return {
						model: input.model,
						msgCmd: [focusView(CODE_INPUT_VIEW_ID)],
					};
				}

				default: {
					return { model: input.model };
				}
			}
		}
		default: {
			return { model: input.model };
		}
	}
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
			const phoneNumber = PhoneNumber.fromString(
				model.inputtedPhoneNumber,
				model.countryCodeInput,
			);

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
						preferredLanguage: ctx.navigatorLanguage,
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
						phoneNumber: msg.phoneNumber,
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
							TimeSpan.seconds(30),
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
							TimeSpan.seconds(30),
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

			input.ctx.t(
				"auth-sms.sent-code-to",
				PhoneNumber.format(msgServer.phoneNumber),
			);

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
						phoneNumber: msgServer.phoneNumber,
					}),
					showToast(
						input.ctx.t(
							"auth-sms.sent-code-to",
							PhoneNumber.format(msgServer.phoneNumber),
						),
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

const View: Module["View"] = (input) => {
	switch (input.ctx.currentRoute.n) {
		case "auth-login": {
			switch (input.ctx.currentRoute.t) {
				case "login-sms-request": {
					return <ViewSendCode {...input} />;
				}
				case "login-sms-verify": {
					return <ViewVerifyCode {...input} />;
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

const ViewSendCode: Module["View"] = (input) => {
	return (
		<div className="w-full flex-1">
			<TopBar
				onBack={() => input.dispatch({ t: "clicked-back-button" })}
				ctx={input.ctx}
				title={input.ctx.t("auth-sms.login-with-phone")}
			/>

			<div className="flex w-full flex-col gap-6 p-4 py-6">
				{true && (
					<Select
						id="countryCode"
						label={input.ctx.t("auth-sms.country")}
						onChange={(countryCodeNew) => {
							input.dispatch({
								t: "inputted-country-code",
								countryCode: countryCodeNew,
							});
						}}
						value={input.model.countryCodeInput}
						options={Iso3166Alpha2Code.all}
						toKey={(countryCode) => countryCode}
						toName={(countryCode) =>
							Iso3166Alpha2Code.toNameWithEmoji(countryCode)
						}
					/>
				)}

				<TextField
					id="phoneNumberInput"
					label={input.ctx.t("auth-sms.phone-number")}
					type="tel"
					startIcon={<IconMobilePhone className="h-5 w-5" />}
					error={typeof input.model.phoneNumberError === "string"}
					helperText={input.model.phoneNumberError}
					onChange={(value) => {
						input.dispatch({
							t: "inputted-phone-number",
							phoneNumber: value,
						});
					}}
					onClear={() => {
						input.dispatch({ t: "clicked-phone-number-clear" });
					}}
				/>

				<Button
					text={input.ctx.t("auth-sms.send-code")}
					className="w-full"
					variant="contained"
					color="primary"
					size="lg"
					loading={input.model.sendCode.t === "loading"}
					onClick={() => {
						input.dispatch({ t: "user-clicked-send-code-button" });
					}}
				/>
			</div>

			{isErr(input.model.sendCode) && (
				<div className="w-full p-4">
					<AlertError
						text={sendCodeProblemToString({
							problem: input.model.sendCode.error,
							t: input.ctx.t,
						})}
					/>
				</div>
			)}
		</div>
	);
};

const ViewVerifyCode: Module["View"] = (input) => {
	if (input.ctx.currentRoute.t !== "login-sms-verify") {
		return null;
	}

	const phoneNumber = input.ctx.currentRoute.phoneNumber;

	return (
		<div className="w-full flex-1">
			<TopBar
				onBack={() => input.dispatch({ t: "clicked-back-button" })}
				ctx={input.ctx}
				title={input.ctx.t("auth-sms.login-with-phone")}
			/>

			<div className="flex w-full flex-col gap-6 p-4 py-6">
				<Text
					role="status"
					className="text-lg"
					value={input.ctx.t(
						"auth-sms.enter-code-sent-to",
						PhoneNumber.format(phoneNumber),
					)}
				/>
				<TextField
					id={CODE_INPUT_VIEW_ID}
					label={input.ctx.t("auth-sms.code")}
					error={typeof input.model.inputtedCodeError === "string"}
					helperText={
						typeof input.model.inputtedCodeError === "string"
							? input.model.inputtedCodeError
							: null
					}
					autoFocus
					type="tel"
					onChange={(value) => {
						input.dispatch({ t: "inputted-code", inputtedCode: value });
					}}
					onClear={() => {
						input.dispatch({ t: "clicked-code-clear" });
					}}
				/>
				<Button
					className="w-full"
					text={input.ctx.t("auth-sms.verify-code")}
					color="primary"
					size="lg"
					loading={
						input.model.verifyCode.t === "loading" ||
						input.model.verifyCode.t === "ok"
					}
					onClick={() => {
						input.dispatch({
							t: "user-clicked-verify-code-button",
							phoneNumber,
							inputtedCode: input.model.inputtedCode,
						});
					}}
				/>
			</div>

			{isErr(input.model.verifyCode) && (
				<div className="w-full p-4">
					<AlertError
						text={verifyCodeProblemToString({
							problem: input.model.verifyCode.error,
							t: input.ctx.t,
						})}
					/>
				</div>
			)}
		</div>
	);
};

export const AuthSMSClient = {
	init,
	update,
	subscriptions,
	View,
};
