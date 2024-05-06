import { p } from "../core/parser";

export const AnyMsg = p.obj({
	t: p.str,
});

export type AnyMsg = p.Infer<typeof AnyMsg>;

export const Msg = <
	TTag extends string,
	TPayload extends Record<string, unknown>,
>(
	t: TTag,
	payloadParser: p.Parser<TPayload> = p.dict(
		p.str,
		p.unknown,
	) as p.Parser<TPayload>,
) => {
	function msgCreator(payload: TPayload) {
		return { t, ...payload };
	}
	const MsgBase = p.obj({
		t: p.l(t),
	});
	const MsgWithPayload = p.and(payloadParser, MsgBase);

	type Msg = p.Infer<typeof MsgWithPayload>;

	function is(msg: unknown): msg is Msg {
		const parsed = AnyMsg.parse(msg);
		return parsed.t === "ok" && parsed.value.t === t;
	}

	msgCreator.is = is;
	msgCreator.parse = MsgWithPayload.parse;

	return msgCreator;
};

export const Namespace = <TNamespace extends string>(namespace: TNamespace) => {
	return <TTag extends string, TPayload extends Record<string, unknown>>(
		t: TTag,
		payloadParser: p.Parser<TPayload> = p.dict(
			p.str,
			p.unknown,
		) as p.Parser<TPayload>,
	) => {
		return Msg(`${namespace}.${t}`, payloadParser);
	};
};
