import { type ClientId, SessionId } from "gamezilla-app/app/@/data";
import type { ILogger } from "gamezilla-app/app/@/server/logger/logger";
import type { ServerNode } from "gamezilla-app/@/server/server-impl-node/server-impl-node";
import { Server } from "socket.io";
import type {
	MsgClientToMsgServer,
	MsgServerToMsgClient,
} from "../transport.core";
import { type IServerTransport, initServerTransport } from "./transport-server";
import { COOKIE_DOMAIN } from "public-config";

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
			methods: ["GET", "POST"],
		},
		transports: ["websocket"],
		allowUpgrades: true,
		cookie: {
			name: "gamezilla-app-session-id",
			domain: COOKIE_DOMAIN,
			httpOnly: true,
			sameSite: "none",
			secure: true,
			path: "/",
		},
	});

	io.on("connection", (socket) => {
		const maybeSessionId = socket.handshake.headers.cookie
			?.split(";")
			.find((c) => c.trim().startsWith("gamezilla-app-session-id="))
			?.split("=")[1];

		const sessionId = SessionId.is(maybeSessionId)
			? maybeSessionId
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
