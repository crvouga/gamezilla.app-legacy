import {
	type ClientCmd,
	type ClientEvent,
	showToast,
} from "gamezilla-app/app/@/client";
import type { Eff, Sub } from "gamezilla-app/@/core";
import { ListItemButton, cn } from "../@/ui";
import type { IClientTransport } from "./transport-client";
import type { ModelClient, MsgClient, MsgToClient } from "./wire.types";

//
//
//
// Model
//
//
//

export const init = (_input: {
	stored: Record<string, unknown> | null;
}): { model: ModelClient } => {
	return {
		model: {
			state: {
				t: "server-connecting",
			},
			serverTime: null,
		},
	};
};

//
//
//
//  Update
//
//
//

export const update = <
	TMsgToClient extends Record<string, unknown>,
	TMsgToServer extends Record<string, unknown>,
>({
	msg,
	msgServer,
	msgCmd,
	model,
	transport,
}: {
	msg?: MsgClient | null;
	msgServer?: MsgToClient | null;
	msgCmd?: ClientCmd<{
		MsgClient: MsgClient;
		MsgToServer: TMsgToServer;
	}> | null;
	model: ModelClient;
	transport: IClientTransport<{
		MsgToServer: TMsgToServer;
		MsgToClient: TMsgToClient;
	}>;
}): {
	model: ModelClient;
	msgEvt?: ClientEvent[];
	eff?: Eff<MsgClient>;
} => {
	if (msg) {
		return updateFromMsg({ msg, model, transport });
	}

	if (msgServer) {
		return updateFromServer({ model, msgServer, transport });
	}

	if (msgCmd) {
		return updateFromCmd({
			msgCmd,
			model,
			transport,
		});
	}

	return { model };
};

const updateFromMsg: typeof update = ({ msg, model, transport }) => {
	if (!msg) {
		return { model };
	}

	switch (msg.t) {
		case "server-connect-error": {
			return {
				model: {
					...model,
					state: {
						t: "server-connect-error",
						errorCount:
							model.state.t === "server-connect-error"
								? model.state.errorCount + 1
								: 1,
					},
				},
			};
		}

		case "server-connected": {
			return {
				model: {
					...model,
					state: {
						t: "server-connected",
					},
				},
				msgEvt: [{ t: "wire/server-connected" }],
			};
		}

		case "server-disconnected": {
			return { model: { ...model, state: { t: msg.t } } };
		}

		case "clicked-try-reconnect": {
			return {
				model: { ...model, state: { t: "server-connecting" } },
				eff: () => {
					transport.msgCmd.pub({ t: "try-reconnect" });
				},
			};
		}

		case "got-bad-msgs": {
			switch (msg.reason) {
				case "codebase-version-mismatch": {
					return {
						model,
					};
				}
			}
		}
	}
};

const updateFromServer: typeof update = ({ model, msgServer }) => {
	if (!msgServer) {
		return { model };
	}

	switch (msgServer.t) {
		case "server-restarted": {
			return {
				model,
				msgCmd: [showToast("Server restarted")],
			};
		}
	}
};

const updateFromCmd: typeof update = ({ msgCmd, model, transport }) => {
	if (!msgCmd) {
		return { model };
	}

	const wireCmd = msgCmd.c;

	switch (wireCmd.t) {
		case "send-to-server": {
			return {
				model,
				eff: () => {
					if (wireCmd.msg) {
						transport.toServer.pub([wireCmd.msg]);
					}
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
// View
//
//
//

export const ViewStatusBar = (props: { model: ModelClient }) => {
	switch (props.model.state.t) {
		case "server-connected": {
			return <span className="h-2 w-2 rounded-full bg-green-500" />;
		}

		case "server-connecting":
		case "server-connect-error": {
			return (
				<div className="flex animate-pulse items-center gap-1">
					<span className="h-2 w-2 rounded-full bg-orange-500" />
					<p className="text-orange-500">Connecting...</p>
				</div>
			);
		}

		case "server-disconnected": {
			return (
				<div className="flex items-center gap-1">
					<span className="h-2 w-2 rounded-full bg-red-500" />
					<p className="text-red-500">Offline</p>
				</div>
			);
		}
	}
};

export const ViewStatusBarDrawer = ({
	model,
	dispatch,
}: {
	model: ModelClient;
	dispatch: (m: MsgClient) => void;
}) => {
	switch (model.state.t) {
		case "server-connected": {
			return (
				<ListItemButton
					icon={(props) => (
						<span
							className={cn(props.className, "rounded-full bg-green-500")}
						/>
					)}
					className="text-green-500"
					label="Online"
				/>
			);
		}

		case "server-connect-error":
		case "server-connecting": {
			return (
				<ListItemButton
					icon={(props) => (
						<span
							className={cn(props.className, "rounded-full bg-orange-500")}
						/>
					)}
					color="warning"
					label="Connecting..."
				/>
			);
		}

		case "server-disconnected": {
			return (
				<ListItemButton
					icon={(props) => (
						<span className={cn(props.className, "rounded-full bg-red-500")} />
					)}
					color="danger"
					label="Offline"
					end={() => {
						return (
							<button
								type="button"
								onClick={() => dispatch({ t: "clicked-try-reconnect" })}
								className="font-bold text-red-500"
							>
								Try reconnect
							</button>
						);
					}}
				/>
			);
		}
	}
};

//
//
//
//
//
//

export const subscriptions = <MsgToServer, MsgToClient>({
	transport,
}: {
	transport: IClientTransport<{
		MsgToServer: MsgToServer;
		MsgToClient: MsgToClient;
	}>;
}): Sub<MsgClient> => {
	return transport.msgEvt;
};
