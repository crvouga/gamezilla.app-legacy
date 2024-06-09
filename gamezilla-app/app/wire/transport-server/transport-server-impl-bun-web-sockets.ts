import type { Server, ServerWebSocket, WebSocketHandler } from "bun";
import { ClientId, SessionId } from "gamezilla-app/app/@/data";
import type { ServerBun } from "gamezilla-app/@/server/server-impl-bun/server-impl-bun";
import type {
	MsgClientToMsgServer,
	MsgServerToMsgClient,
} from "../transport.core";
import { type IServerTransport, initServerTransport } from "./transport-server";
import { COOKIE_DOMAIN } from "public-config";

type ServerWebSocketData = {
	clientId: ClientId;
	sessionId: SessionId;
};

export const ServerTransportBunWebSockets = <MsgToServer, MsgToClient>({
	server,
	codebaseVersionId,
}: {
	codebaseVersionId: string;
	server: ServerBun;
}): IServerTransport<{
	MsgToClient: MsgToClient;
	MsgToServer: MsgToServer;
}> => {
	//
	//
	//
	// Output
	//
	//
	//

	const transport = initServerTransport<MsgToServer, MsgToClient>();

	//
	//
	//
	// State
	//
	//
	//

	const clients = new Map<ClientId, ServerWebSocket<ServerWebSocketData>>();
	const clientsBySessionId = new Map<SessionId, Set<ClientId>>();
	const addClient = (ws: ServerWebSocket<ServerWebSocketData>) => {
		clients.set(ws.data.clientId, ws);

		const clientIds = clientsBySessionId.get(ws.data.sessionId);

		if (!clientIds) {
			const clientIdsNew = new Set<ClientId>();
			clientIdsNew.add(ws.data.clientId);
			clientsBySessionId.set(ws.data.sessionId, clientIdsNew);
			return;
		}

		clientIds.add(ws.data.clientId);
	};

	const removeClient = (ws: ServerWebSocket<ServerWebSocketData>) => {
		clients.delete(ws.data.clientId);

		const clientIds = clientsBySessionId.get(ws.data.sessionId);

		if (!clientIds) {
			return;
		}

		clientIds.delete(ws.data.clientId);
	};

	//
	//
	//
	// Web Server
	//
	//
	//

	const onRequest = (req: Request, server: Server) => {
		const url = new URL(req.url);

		switch (url.pathname) {
			case "/ws": {
				const maybeSessionIdCookie = req.headers
					.get("cookie")
					?.match(/gamezilla-app-session-id=([^;]+)/);
				
				const maybeSessionId = maybeSessionIdCookie
					? maybeSessionIdCookie[1]
					: null;

				const sessionId = SessionId.is(maybeSessionId)
					? maybeSessionId
					: SessionId.generate();

				const clientId = ClientId.generate();

				const data: ServerWebSocketData = {
					clientId,
					sessionId,
				};

				const headers: Record<string, string> = maybeSessionId
					? {}
					: {
							"Set-Cookie": `gamezilla-app-session-id=${sessionId}; SameSite=None; Domain=${COOKIE_DOMAIN}; Secure; HttpOnly; Path=/; Max-Age=31536000;`,
						};

				const didUpgrade = server.upgrade(req, {
					headers,
					data,
				});

				if (didUpgrade) {
					return new Response("Upgrade successful");
				}

				return new Response("Upgrade failed", { status: 500 });
			}

			default: {
				return null;
			}
		}
	};

	const websocket: WebSocketHandler<ServerWebSocketData> = {
		open(ws: ServerWebSocket<ServerWebSocketData>) {
			addClient(ws);
			transport.wire.pub({
				t: "client-connected",
				clientId: ws.data.clientId,
				sessionId: ws.data.sessionId,
			});
		},
		close(ws: ServerWebSocket<ServerWebSocketData>, _code, _message) {
			removeClient(ws);
			transport.wire.pub({
				t: "client-disconnected",
				clientId: ws.data.clientId,
				sessionId: ws.data.sessionId,
			});
		},
		message(ws: ServerWebSocket<ServerWebSocketData>, message) {
			const msg = JSON.parse(
				message.toString(),
			) as MsgClientToMsgServer<MsgToServer>; // leap of faith

			switch (msg.codebaseVersionId) {
				case codebaseVersionId: {
					switch (msg.t) {
						case "to-server": {
							transport.toServer.pub({
								clientId: ws.data.clientId,
								sessionId: ws.data.sessionId,
								msgs: msg.msgs,
							});
							return;
						}
						default: {
							transport.wire.pub({
								t: "got-bad-msgs",
								reason: "unknown-msg-type",
								clientId: ws.data.clientId,
								sessionId: ws.data.sessionId,
								msgs: msg.msgs,
							});
							return;
						}
					}
				}

				default: {
					transport.wire.pub({
						t: "got-bad-msgs",
						reason: "codebase-version-id-mismatch",
						clientId: ws.data.clientId,
						sessionId: ws.data.sessionId,
						msgs: msg.msgs,
					});
					return;
				}
			}
		},
	};

	server._registerFetchHandler(onRequest);
	server._setWebSocketHandler(websocket);

	transport.wire.pub({ t: "server-started", port: Number.NaN });

	//
	//
	//
	// Hook up topics
	//
	//
	//

	transport.topicPublish.sub((msg) => {
		for (const topic of msg.topics) {
			server._publish(topic, JSON.stringify(msg.msg));
		}
	});

	transport.topicSubscribe.sub((msg) => {
		const client = clients.get(msg.clientId);
		if (!client) {
			return;
		}
		for (const topic of msg.topics) {
			client.subscribe(topic);
		}
	});

	//
	//
	//
	// Hook up toClient
	//
	//
	//

	const send = (
		ws: ServerWebSocket<ServerWebSocketData>,
		msg: MsgServerToMsgClient<MsgToClient>,
	) => {
		Promise.resolve().then(() => {
			switch (ws.readyState) {
				case 1: {
					ws.send(JSON.stringify(msg));
					return;
				}
				default: {
					return;
				}
			}
		});
	};

	transport.toClientBroadcast.sub((msgs) => {
		for (const client of clients.values()) {
			send(client, { t: "to-client", msgs, codebaseVersionId });
		}
	});

	transport.toClient.sub((toClient) => {
		for (const clientId in toClient) {
			const toClientSingle = toClient[clientId as ClientId]!;
			const client = clients.get(clientId as ClientId);

			if (!client) {
				continue;
			}

			send(client, {
				t: "to-client",
				msgs: toClientSingle.msgs,
				codebaseVersionId,
			});
		}
	});

	//
	//
	//
	//
	//
	//

	return transport;
};
