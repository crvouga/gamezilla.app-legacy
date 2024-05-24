import { NonEmpty, PubSub } from "gamezilla-app/@/core";
import type { WithEventMeta } from "gamezilla-app/app/spaces/@/event";
import { SpaceCoreFixture } from "gamezilla-app/app/spaces/@/testing/core";
import { FlowClientFixture } from "../../@/testing";
import { PlayClient } from "../play.client";
import { PlayCore } from "../play.core";
import type { ModelCore, MsgClient, MsgCore, MsgToClient } from "../play.types";

export const FlowPlayClientFixture = async () => {
	const f = await FlowClientFixture();
	const initCore = PlayCore.initCore(f);

	type Output = ReturnType<typeof PlayClient.update> & {
		modelCore: ModelCore;
	};

	type Msg = {
		msg?: MsgClient;
		msgServer?: MsgToClient;
		msgCore?: WithEventMeta<MsgCore>;
	};

	const render = (output: Output) => {
		const msgs = PubSub.create<MsgClient>();
		const rendered = f.render(
			<PlayClient.View
				ctx={f.ctx}
				dispatch={msgs.publish}
				model={output.model}
				modelCore={output.modelCore}
			/>,
		);
		return { ...rendered, msgs };
	};

	const toModelCore = (outputs: Omit<Output, "modelCore">[]): ModelCore => {
		return outputs
			.flatMap((output) => output.msgCore ?? [])
			.reduce(
				(modelCore, msgCore) =>
					PlayCore.updateCore({ ctx: f.ctx, modelCore, msgCore }),
				initCore,
			);
	};

	const updates = (output: Output, msgs: Msg[]): NonEmpty<Output> => {
		const outputs: NonEmpty<Output> = [output];
		for (const msg of msgs) {
			const lastOutput = NonEmpty.last(outputs);
			const nextOutput = PlayClient.update({
				model: lastOutput.model,
				ctx: f.ctx,
				modelCore: toModelCore(outputs),
				...msg,
			});
			outputs.push({
				...nextOutput,
				modelCore: toModelCore([...outputs, nextOutput]),
			});
		}
		return outputs;
	};

	const update = (output: Output, msgs: Msg[]): Output => {
		return NonEmpty.last(updates(output, msgs));
	};

	const initial: Output = {
		model: PlayClient.init,
		modelCore: initCore,
	};

	return {
		...f,
		initial,
		render,
		update,
		updates,
	};
};

export const CoreFixture = async () => {
	const f = await SpaceCoreFixture();

	const updates = (
		modelCore: ModelCore,
		msgs: MsgCore[],
	): NonEmpty<ModelCore> => {
		const [msgCore, ...rest] = msgs;

		if (!msgCore) {
			return [modelCore];
		}

		const updated = PlayCore.updateCore({ ctx: f.ctx, modelCore, msgCore });

		return [modelCore, ...updates(updated, rest)];
	};

	const update = (modelCore: ModelCore, msgCore: MsgCore[]): ModelCore => {
		return NonEmpty.last(updates(modelCore, msgCore));
	};

	const init = PlayCore.initCore({
		ctx: f.ctx,
	});

	return {
		init,
		f,
		updates,
		update,
	};
};
