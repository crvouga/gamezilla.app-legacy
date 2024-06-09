import type { ServerNode } from "gamezilla-app/@/server/server-impl-node/server-impl-node";
import { SessionId, type ClientId } from "gamezilla-app/app/@/data";
import type { ILogger } from "gamezilla-app/app/@/server/logger/logger";
import { Server } from "socket.io";
import {
	ORIGINS,
	SESSION_ID_COOKIE_NAME,
	toSetSessionCookie,
	type MsgClientToMsgServer,
	type MsgServerToMsgClient,
} from "../transport.core";
import { initServerTransport, type IServerTransport } from "./transport-server";
import { HttpResponse } from "gamezilla-app/@/server";

export const ServerTransportSocketIO = async <MsgToServer, MsgToClient>({
	server,
	codebaseVersionId,
}: {
	logger: ILogger;
	codebaseVersionId: string;
	server: ServerNode;
}): Promise<
	IServerTransport<{
		MsgToClient: MsgToClient;
		MsgToServer: MsgToServer;
	}>
> => {
	const transport = initServerTransport<MsgToServer, MsgToClient>();

	const io = new Server(server.httpServer, {
		cors: {
			origin: "*",
			credentials: true,
		},
		transports: ["websocket"],
		allowUpgrades: true,
	});

	server.registerHandler(async (request) => {
		if (request.pathname !== "/set-session-cookie") {
			return null;
		}
		const origin = Array.isArray(ORIGINS)
			? ORIGINS.join(", ")
			: request.headers.origin ?? "*";
		const maybeSessionId = request.cookies[SESSION_ID_COOKIE_NAME];
		const sessionId = SessionId.is(maybeSessionId)
			? maybeSessionId
			: SessionId.generate();

		const headersBase = {
			"Access-Control-Allow-Origin": origin,
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
			"Access-Control-Allow-Credentials": "true",
			"Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
			"Content-Security-Policy": "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none';",
		};

		if (sessionId === maybeSessionId) {
			const res: HttpResponse = {
				status: 200,
				headers: headersBase,
				body: "OK",
			};
			return res;
		}

		const res: HttpResponse = {
			status: 200,
			headers: {
				...headersBase,
				"Set-Cookie": toSetSessionCookie(sessionId),
			},
			body: "OK",
		};

		return res;
	});

	io.on("connection", (socket) => {
		const cookies = (socket.handshake.headers.cookie ?? "")
			.split(";")
			.reduce<Record<string, string>>((acc, cookie) => {
				const [name, value] = cookie.trim().split("=");
				if (!name || !value) return acc;
				acc[name] = value;
				return acc;
			}, {});

		const probablySessionId = cookies[SESSION_ID_COOKIE_NAME];

		const sessionId = SessionId.is(probablySessionId)
			? probablySessionId
			: SessionId.generate();

		const clientId = socket.id as ClientId;

		transport.wire.pub({ t: "client-connected", clientId, sessionId });

		socket.on(
			"to-server",
			(msg: MsgClientToMsgServer<MsgToServer>, acknowledge: () => void) => {
				if (msg.v !== codebaseVersionId) {
					transport.wire.pub({
						t: "got-bad-msgs",
						clientId,
						msgs: msg.m,
						reason: "codebase-version-id-mismatch",
						sessionId,
					});
				}

				transport.toServer.pub({
					msgs: msg.m,
					clientId: clientId,
					sessionId: sessionId,
				});

				acknowledge();
			},
		);

		const unsubscribe = transport.toClient.sub((msgsByClientId) => {
			const msgs = msgsByClientId[clientId];

			if (!msgs) {
				return;
			}

			const toClient: MsgServerToMsgClient<MsgToClient> = {
				v: codebaseVersionId,
				m: msgs.msgs,
			};

			socket.emit("to-client", toClient);
		});

		socket.on("disconnect", () => {
			unsubscribe();

			transport.wire.pub({
				t: "client-disconnected",
				clientId,
				sessionId,
			});
		});
	});

	transport.toClientBroadcast.sub((msgs) => {
		const toClient: MsgServerToMsgClient<MsgToClient> = {
			v: codebaseVersionId,
			m: msgs,
		};

		io.emit("to-client", toClient);
	});

	return transport;
};
