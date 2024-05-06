import { Posix, Sub, Time, TimeSpan } from "gamezilla-app/@/core";
import { AppClientModule } from "gamezilla-app/app/@/architecture/app-client";
import {
	APP_SOUND,
	SoundCmd,
	playSound,
	type ToastCmd,
} from "gamezilla-app/app/@/client";
import { IconXMark, Show, Transition, cn } from "gamezilla-app/app/@/ui";

//
//
//
// Module
//
//
//

type Ctx = { now: Posix };

type Module = AppClientModule<{
	Model: Model;
	Msg: Msg;
	MsgCmdIn: ToastCmd;
	Ctx: Ctx;
	//
	MsgToClient: null;
	MsgToServer: null;
	//
	MsgCmdOut: SoundCmd;
	//
	MsgEvtIn: null;
	MsgEvtOut: null;
}>;

//
//
//
// Model
//
//
//

export type Model = {
	runningId: number;
	toast?: Toast | null;
	hold: {
		[toastId: number]: Toast;
	};
	errorModal?: { errorMsg: string; toastId: number } | null;
};

export type Toast = {
	toastId: number;
	text: string;
	duration: TimeSpan;
	variant: "error" | "info";
	createdAt: Posix;
	errorMsg?: string | null;
};

export const init: Module["init"] = () => {
	return {
		model: { runningId: 0, hold: {} },
	};
};

//
//
//
// Update
//
//
//

export type Msg =
	| { t: "time-passed" }
	| { t: "pressed-down-on-toast"; toast: Toast }
	| { t: "pressed-up-on-toast"; toast: Toast }
	| { t: "clicked-dismiss-button"; toastId: number }
	| { t: "clicked-see-error"; errorMsg: string; toastId: number };

export const update: Module["update"] = (input) => {
	return AppClientModule.andThen(
		{ model: input.model },
		(model) => updateFromMsg({ ...input, model }),
		(model) => updateFromCmd({ ...input, model }),
	);
};

const updateFromMsg: Module["update"] = (input) => {
	if (!input.msg) {
		return { model: input.model };
	}

	const { ctx, model, msg } = input;

	switch (msg.t) {
		case "clicked-dismiss-button": {
			return {
				model: {
					...model,
					toast: null,
				},
				msgCmd: [playSound(APP_SOUND.tap)],
			};
		}

		case "time-passed": {
			if (!model.toast) {
				return { model };
			}

			const isToastInactive = TimeSpan.lte(
				model.toast.duration,
				Posix.diff(model.toast.createdAt, ctx.now),
			);

			if (isToastInactive) {
				return { model: { ...model, toast: null } };
			}

			return { model };
		}

		case "pressed-down-on-toast": {
			return {
				model: {
					...model,
					hold: {
						...model.hold,
						[msg.toast.toastId]: msg.toast,
					},
				},
			};
		}

		case "pressed-up-on-toast": {
			const holdNew = { ...model.hold };
			delete holdNew[msg.toast.toastId];
			return {
				model: {
					...model,
					hold: holdNew,
				},
			};
		}

		case "clicked-see-error": {
			return {
				model: {
					...model,
					errorModal: {
						errorMsg: msg.errorMsg,
						toastId: msg.toastId,
					},
				},
			};
		}
	}
};

const updateFromCmd: Module["update"] = (input) => {
	if (!input.msgCmd) {
		return { model: input.model };
	}

	const { ctx, msgCmd, model } = input;

	const toastCmd = msgCmd.c;

	switch (toastCmd.t) {
		case "enqueue": {
			const toastNew: Toast = {
				toastId: model.runningId,
				text: toastCmd.text,
				duration: toastCmd.duration ?? TimeSpan.fromSeconds(2),
				variant: toastCmd.toastVariant ?? "info",
				createdAt: ctx.now,
				errorMsg: toastCmd.errorMsg ?? null,
			};

			return {
				model: {
					...model,
					runningId: model.runningId + 1,
					toast: toastNew,
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

export const subscriptions: Module["subscriptions"] = ({ model }) => {
	if (model.toast) {
		return Time.interval("toasts", model.toast.duration, () => ({
			t: "time-passed",
		}));
	}

	return Sub.None;
};

//
//
//
// View
//
//
//

export const View: Module["View"] = (props) => {
	return (
		<Transition mode="out-in" id="toast-root" onEnter={onEnter} onExit={onExit}>
			<Show
				when={() => props.model.toast}
				render={(toast) => (
					<Toast key={toast.toastId} toast={toast} dispatch={props.dispatch} />
				)}
			/>
		</Transition>
	);
};

const onEnter = async (node: HTMLElement) => {
	await node?.animate(
		[
			{
				transform: "translateY(-150%)",
			},
			{
				transform: "translateY(0%)",
			},
		],
		{
			duration: 200,
			easing: "ease-in-out",
			fill: "both",
		},
	).finished;
};

const onExit = async (node: HTMLElement) => {
	await node?.animate(
		[
			{
				transform: "translateY(0%)",
			},
			{
				transform: "translateY(-150%)",
			},
		],
		{
			duration: 200,
			easing: "ease-in-out",
			fill: "both",
		},
	).finished;
};

const Toast = (props: { toast: Toast; dispatch: (m: Msg) => void }) => {
	const errorMsg = props.toast.errorMsg;
	return (
		<div
			id={String(props.toast.toastId)}
			className="pointer-events-none absolute left-0 top-0 z-40 w-full overflow-visible p-4"
			//
			onMouseDown={() =>
				props.dispatch({ t: "pressed-down-on-toast", toast: props.toast })
			}
			onMouseUp={() =>
				props.dispatch({ t: "pressed-up-on-toast", toast: props.toast })
			}
			//
			onTouchStart={() =>
				props.dispatch({ t: "pressed-down-on-toast", toast: props.toast })
			}
			onTouchEnd={() =>
				props.dispatch({ t: "pressed-up-on-toast", toast: props.toast })
			}
			//
			onContextMenu={(e) => {
				e.preventDefault();
			}}
		>
			<div
				className={cn(
					"pointer-events-auto z-40 flex w-full items-center justify-between overflow-hidden  rounded-lg border p-3 text-lg text-white shadow-2xl",
					props.toast.variant === "info" && "border-neutral-600 bg-neutral-700",
					props.toast.variant === "error" && "border-red-400 bg-red-500",
				)}
				key={props.toast.toastId}
			>
				{props.toast.text}
				{errorMsg && (
					<>
						<button
							type="button"
							className="font-bold"
							onClick={() =>
								props.dispatch({
									t: "clicked-see-error",
									errorMsg: errorMsg,
									toastId: props.toast.toastId,
								})
							}
						>
							See Error
						</button>
					</>
				)}
				<button
					type="button"
					onClick={() =>
						props.dispatch({
							t: "clicked-dismiss-button",
							toastId: props.toast.toastId,
						})
					}
				>
					<IconXMark className="w-5 h-5" />
				</button>
			</div>
		</div>
	);
};
