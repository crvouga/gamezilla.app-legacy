export type AnyMsg = Record<string, unknown> & {
	t: string;
	c?: unknown;
};

export const isAnyMsg = (msg: unknown): msg is AnyMsg => {
	return typeof msg === "object" && msg !== null && "t" in msg;
};

export const toMsgType = (msg: unknown): string => {
	if (!isAnyMsg(msg)) {
		return String(msg);
	}

	if (isAnyMsg(msg.c)) {
		return `${msg.t}.${toMsgType(msg.c)}`;
	}
	return msg.t;
};

export const toMsgPayload = (
	msg: unknown,
	acc: Record<string, unknown> = {},
): Record<string, unknown> => {
	if (!isAnyMsg(msg)) {
		return acc;
	}
	const { t, c, ...payload } = msg;
	if (isAnyMsg(msg.c)) {
		return toMsgPayload(msg.c, { ...acc, ...payload });
	}
	return { ...acc, ...payload };
};
