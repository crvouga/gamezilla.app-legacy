import type {
	MsgClientToMsgServer,
	MsgServerToMsgClient,
} from "../transport.core";
import {
	type ClientTransportCommand,
	type ClientTransportEvent,
	type ClientTransportWebSocketImpl,
	type IClientTransport,
	initClientTransport,
} from "./transport-client";

const RECONNECT_INTERVAL = 2000; // 1 second
const MAX_RECONNECT_ATTEMPTS = 6; // Adjust as needed

type Model<MsgToServer> = {
	reconnectAttempts: number;
	isConnected: boolean;
	isDocumentHidden: boolean;
	queue: MsgClientToMsgServer<MsgToServer>[];
};

export const init = <MsgToServer>(): Model<MsgToServer> => ({
	reconnectAttempts: 0,
	isConnected: false,
	isDocumentHidden: false,
	queue: [],
});

export const update = <MsgToServer>({
	model,
	evt,
	cmd,
}: {
	model: Model<MsgToServer>;
	evt?: ClientTransportEvent;
	cmd?: ClientTransportCommand;
}): Model<MsgToServer> => {
	const msg = evt ?? cmd;
	if (!msg) {
		return model;
	}
	switch (msg.t) {
		case "try-reconnect": {
			return {
				...model,
				reconnectAttempts: 0,
			};
		}

		case "got-bad-msgs": {
			return model;
		}

		case "server-connect-error": {
			return model;
		}

		case "server-connected": {
			return {
				...model,
				isConnected: true,
			};
		}

		case "server-disconnected": {
			return {
				...model,
				isConnected: false,
			};
		}
	}
};

export const ClientTransportWebSockets = <MsgToServer, MsgToClient>({
	codebaseVersionId,
	impl,
}: {
	codebaseVersionId: string;
	impl: ClientTransportWebSocketImpl;
}): IClientTransport<{
	MsgToServer: MsgToServer;
	MsgToClient: MsgToClient;
}> => {
	const serverUrl = toWebsocketServerUrl(impl.serverUrl);

	const transport = initClientTransport<MsgToServer, MsgToClient>();

	if (typeof window === "undefined") {
		return transport;
	}

	let reconnectAttempts = 0;
	let ws: WebSocket;
	let isConnected = false;
	let isDocumentHidden = false;
	let queue: MsgClientToMsgServer<MsgToServer>[] = [];

	const connect = async () => {
		if (isConnected) {
			return;
		}

		ws = new WebSocket(serverUrl);

		ws.onopen = () => {
			isConnected = true;
			reconnectAttempts = 0;
			transport.msgEvt.pub({ t: "server-connected" });
			for (const msg of queue) {
				send(msg);
			}
			queue = [];
		};

		ws.onerror = () => {
			isConnected = false;
			transport.msgEvt.pub({ t: "server-connect-error" });
		};

		ws.onclose = () => {
			isConnected = false;
			if (isDocumentHidden) {
				return;
			}

			if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
				transport.msgEvt.pub({ t: "server-disconnected" });
				return;
			}
			reconnectAttempts++;
			setTimeout(connect, RECONNECT_INTERVAL);
			return;
		};

		ws.onmessage = (msgEvt) => {
			isConnected = true;
			const msg = JSON.parse(msgEvt.data) as MsgServerToMsgClient<MsgToClient>; // leap of faith

			if (msg.v !== codebaseVersionId) {
				transport.msgEvt.pub({
					t: "got-bad-msgs",
					reason: "codebase-version-mismatch",
				});
				return;
			}
			transport.toClient.pub(msg.m);
		};
	};

	const closeTimeout: ReturnType<typeof setTimeout> | null = null;
	document.addEventListener("visibilitychange", () => {
		if (document.hidden) {
			isDocumentHidden = true;
			if (ws) {
				ws.close(); // Close the WebSocket connection
				isConnected = false;
			}
			if (closeTimeout) {
				clearTimeout(closeTimeout);
			}
		} else {
			isDocumentHidden = false;
			connect(); // Re-establish the WebSocket connection when the page is shown again
		}
	});

	const send = (msg: MsgClientToMsgServer<MsgToServer>) => {
		if (!isConnected) {
			queue.push(msg);
			return;
		}
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(msg));
			return;
		}
	};

	transport.toServer.sub((msgs) => {
		send({
			m: msgs,
			v: codebaseVersionId,
		});
	});

	transport.msgCmd.sub((msgCmd) => {
		switch (msgCmd.t) {
			case "try-reconnect": {
				reconnectAttempts = 0;
				connect();
				break;
			}
		}
	});

	return {
		...transport,
		start: connect,
	};
};

const toWebsocketServerUrl = (baseServerUrl: string) => {
	const baseServerUrlObj = new URL(baseServerUrl);

	if (typeof window === "undefined") {
		return baseServerUrlObj.toString();
	}

	if (baseServerUrlObj.protocol === "https:") {
		baseServerUrlObj.protocol = "wss";
	}

	if (baseServerUrlObj.protocol === "http:") {
		baseServerUrlObj.protocol = "ws";
	}

	baseServerUrlObj.pathname = "/ws";

	return baseServerUrlObj.toString();
};
