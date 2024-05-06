import { p } from "../core/parser";

export const Msg = p.obj({
	t: p.str,
});

export type Msg = p.Infer<typeof Msg>;

export const createMsg = <
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
	const msgParser = p.and(
		payloadParser,
		p.obj({
			t: p.l(t),
		}),
	);

	function is(msg: unknown): msg is Msg {
		return msgParser.parse(msg).t === "ok";
	}
	return {
		...msgCreator,
		...msgParser,
		is,
	};
};

export const createNamespace = <TNamespace extends string>(
	namespace: TNamespace,
) => {
	return <TTag extends string, TPayload extends Record<string, unknown>>(
		t: TTag,
		payloadParser: p.Parser<TPayload> = p.dict(
			p.str,
			p.unknown,
		) as p.Parser<TPayload>,
	) => {
		return createMsg(`${namespace}.${t}`, payloadParser);
	};
};
