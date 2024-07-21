import { LocalStorage } from "gamezilla-app/@/core";
import { LanguageCodeISO_639_1 } from "gamezilla-app/@/l18n";
import {
	APP_SOUND,
	type AnonymousClientCtx,
	type ClientCmd,
	type ClientCtx,
	type ClientEvent,
	back,
	closeStatusBar,
	playSound,
	pushRoute,
} from "gamezilla-app/app/@/client";
import type { AppClientModule } from "../@/architecture/app-client";
import { translatorSubscriptions } from "../@/client/translator";
import {
	IconCheckmarkCircle,
	IconCheckmarkCircleEmpty,
	IconLanguage,
	ListItemButton,
	Spinner,
	TopBar,
} from "../@/ui";
import type {
	ModelClient,
	MsgClient,
	MsgToClient,
	MsgToServer,
	TranslationLoading,
} from "./lang.types";

//
//
//
//
//
//
//

type Module = AppClientModule<{
	Ctx: AnonymousClientCtx | ClientCtx;
	Model: ModelClient;
	MsgToServer: MsgToServer;
	MsgToClient: MsgToClient;
	Msg: MsgClient;
	MsgCmdIn: null;
	MsgEvtIn: ClientEvent;
	MsgCmdOut: ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>;
	MsgEvtOut: null;
}>;

//
//
//
//
//
//
//

const LANG_STORAGE_KEY = "lang";

export const init: Module["init"] = ({ stored, ctx }) => {
	const storedLang = stored?.[LANG_STORAGE_KEY];

	const initialLang = LanguageCodeISO_639_1.is(storedLang)
		? storedLang
		: ctx.navigatorLanguage;

	return {
		model: {
			lang: initialLang,
			loading: {},
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

export const update: Module["update"] = ({ model, ctx, msg }) => {
	switch (msg?.t) {
		case "translator.loaded": {
			const loadingNew: TranslationLoading = {
				startedAt: model.loading?.[msg.lang]?.startedAt ?? ctx.now,
				endedAt: ctx.now,
			};
			return {
				model: {
					...model,
					loading: {
						...model.loading,
						[msg.lang]: loadingNew,
					},
				},
			};
		}

		case "translator.loading": {
			return {
				model: {
					...model,
					loading: {
						...model.loading,
						[msg.lang]: {
							startedAt: ctx.now,
							endedAt: null,
						},
					},
				},
			};
		}

		case "clicked-change-lang": {
			if (
				ctx.currentRoute.n === "lang" &&
				ctx.currentRoute.t === "choose-lang"
			) {
				return {
					model,
					msgCmd: [playSound(APP_SOUND.navForwardMin), closeStatusBar()],
				};
			}

			return {
				model,
				msgCmd: [
					playSound(APP_SOUND.navForwardMin),
					pushRoute({
						t: "choose-lang",
						n: "lang",
					}),
					closeStatusBar(),
				],
			};
		}

		case "choose-lang.clicked-done": {
			return {
				model,
				msgCmd: [playSound(APP_SOUND.navBackwardMin), back()],
			};
		}

		case "choose-lang.clicked-lang": {
			return {
				model: { ...model, lang: msg.lang },
				msgCmd: [playSound(APP_SOUND.tap)],
				eff: LocalStorage.put(LANG_STORAGE_KEY, msg.lang),
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

export const subscriptions: Module["subscriptions"] = () => {
	return translatorSubscriptions;
};

//
//
//
//
//
//
//

export const ViewStatusBarDrawer: Module["View"] = ({
	model,
	ctx,
	dispatch,
}) => {
	return (
		<ListItemButton
			icon={(input) => <IconLanguage {...input} />}
			label={ctx.t("lang.language")}
			end={() => ctx.t(model.lang)}
			onClick={() => dispatch({ t: "clicked-change-lang" })}
		/>
	);
};

export const View: Module["View"] = (input) => {
	switch (input.ctx.currentRoute.n) {
		case "lang": {
			switch (input.ctx.currentRoute.t) {
				case "choose-lang": {
					return (
						<ViewChooseLang
							ctx={input.ctx}
							dispatch={input.dispatch}
							model={input.model}
						/>
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

const ViewChooseLang: Module["View"] = (input) => {
	return (
		<div className="relative flex h-full w-full flex-col overflow-hidden">
			<TopBar
				ctx={input.ctx}
				onBack={() => input.dispatch({ t: "choose-lang.clicked-done" })}
				title={input.ctx.t("lang.choose-language")}
			/>
			<div className="flex flex-1 flex-col divide-y divide-neutral-700 overflow-y-scroll">
				{LanguageCodeISO_639_1.ALL.map((code) => (
					<ListItemButton
						key={code}
						label={input.ctx.t(code)}
						icon={(inputIcon) => {
							if (input.model.loading[code]?.endedAt === null) {
								return <Spinner {...inputIcon} />;
							}

							if (input.model.lang === code) {
								return <IconCheckmarkCircle {...inputIcon} />;
							}

							return <IconCheckmarkCircleEmpty {...inputIcon} />;
						}}
						end={() => <div>{input.ctx.t(code)}</div>}
						onClick={() =>
							input.dispatch({ t: "choose-lang.clicked-lang", lang: code })
						}
					/>
				))}
				<div className="w-full p-8" />
			</div>
		</div>
	);
};
