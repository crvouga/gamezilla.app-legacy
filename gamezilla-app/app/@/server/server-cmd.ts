import type {ClientId, SessionId, UserId} from 'gamezilla-app/app/@/data';

//
//
//
//
//
//
//

export type WireCmd<MsgToClient> = {
	t: 'wire';
	c:
		| {
				t: 'send-to-user';
				userIds: UserId[];
				msg: MsgToClient;
		  }
		| {
				t: 'broadcast';
				msg: MsgToClient;
		  }
		| {
				t: 'send-to-client';
				clientIds: ClientId[];
				msg: MsgToClient;
		  }
		| {
				t: 'send-to-session';
				sessionIds: SessionId[];
				msg: MsgToClient;
		  }
		| {
				t: 'topic-publish';
				topics: string[];
				msg: MsgToClient;
		  }
		| {
				t: 'topic-subscribe';
				topics: string[];
				clientIds: ClientId[];
		  };
};

export type ServerCmd<TMsgToClient> = WireCmd<TMsgToClient>;

export const topicPublish = <MsgToClient>(
	topics: string[],
	msg: MsgToClient,
): ServerCmd<MsgToClient> => {
	return {
		t: 'wire',
		c: {
			t: 'topic-publish',
			topics,
			msg,
		},
	};
};

export const topicSubscribe = <MsgToClient>(
	topics: string[],
	clientIds: ClientId[],
): ServerCmd<MsgToClient> => {
	return {
		t: 'wire',
		c: {
			t: 'topic-subscribe',
			topics,
			clientIds,
		},
	};
};

export const broadcast = <MsgToClient>(
	msg: MsgToClient,
): ServerCmd<MsgToClient> => {
	return {
		t: 'wire',
		c: {
			t: 'broadcast',
			msg,
		},
	};
};

export const sendToClient = <MsgToClient>(
	clientIdInput:
		| ClientId
		| ClientId[]
		| {clientId: ClientId}
		| {clientIds: ClientId[]},
	msg: MsgToClient,
): ServerCmd<MsgToClient> => {
	const clientIds: ClientId[] = [];

	if (Array.isArray(clientIdInput)) {
		clientIds.push(...clientIdInput);
	} else if ('clientId' in clientIdInput) {
		clientIds.push(clientIdInput.clientId);
	} else if ('clientIds' in clientIdInput) {
		clientIds.push(...clientIdInput.clientIds);
	} else {
		clientIds.push(clientIdInput);
	}

	return {
		t: 'wire',
		c: {
			t: 'send-to-client',
			clientIds,
			msg,
		},
	};
};

export const didSendToClient = <MsgToClient, TCmd>(
	output: {
		msgCmd?: (WireCmd<MsgToClient> | TCmd)[] | null;
	},
	clientId: ClientId,
	predicate: (msg: MsgToClient) => boolean,
): boolean => {
	return (
		((output.msgCmd?.length ?? 0) > 0 &&
			output.msgCmd?.some(
				(cmd) =>
					typeof cmd ===
						'object' &&
					cmd &&
					't' in
						cmd &&
					cmd.t ===
						'wire' &&
					cmd
						.c
						.t ===
						'send-to-client' &&
					cmd.c.clientIds.includes(
						clientId,
					) &&
					predicate(
						cmd
							.c
							.msg,
					),
			)) ??
		false
	);
};

export const didSendMsgToClient = <MsgToClient>(
	output: {msgCmd?: ServerCmd<MsgToClient>[] | null},
	predicate: (msg: MsgToClient) => boolean,
): boolean => {
	return (
		output.msgCmd?.some(
			(cmd) =>
				cmd.t ===
					'wire' &&
				'msg' in
					cmd.c &&
				predicate(
					cmd
						.c
						.msg,
				),
		) ?? false
	);
};

export const sendToSession = <MsgToClient>(
	sessionIds: SessionId[],
	msg: MsgToClient,
): ServerCmd<MsgToClient> => {
	return {
		t: 'wire',
		c: {
			t: 'send-to-session',
			sessionIds,
			msg,
		},
	};
};

export const sendToUser = <MsgToClient>(
	userIds: UserId[],
	msg: MsgToClient,
): ServerCmd<MsgToClient> => {
	return {
		t: 'wire',
		c: {
			t: 'send-to-user',
			userIds,
			msg,
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
//

const mapOne = <A, B>(fn: (a: A) => B, msgCmd: ServerCmd<A>): ServerCmd<B> => {
	switch (msgCmd.t) {
		case 'wire': {
			switch (msgCmd.c.t) {
				case 'send-to-user':
				case 'send-to-session':
				case 'send-to-client':
				case 'topic-publish':
				case 'broadcast': {
					return {
						t: 'wire',
						c: {
							...msgCmd.c,
							msg: fn(
								msgCmd
									.c
									.msg,
							),
						},
					};
				}
				case 'topic-subscribe': {
					return {
						t: 'wire',
						c: {
							t: 'topic-subscribe',
							clientIds: msgCmd
								.c
								.clientIds,
							topics: msgCmd
								.c
								.topics,
						},
					};
				}
			}
		}
	}
};

const map = <A, B>(
	fn: (a: A) => B,
	msgCmd?: ServerCmd<A>[],
): ServerCmd<B>[] => {
	return msgCmd?.map((m) => mapOne(fn, m)) ?? [];
};

const tag = <T extends string, A>(
	tag: T,
	commands?: ServerCmd<A>[],
): ServerCmd<{t: T; c: A}>[] | undefined => {
	return map((c) => ({t: tag, c}), commands);
};

export const ServerCmd = {
	mapOne,
	map,
	tag,
};
