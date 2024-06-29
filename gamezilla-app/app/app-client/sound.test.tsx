import { describe, expect, test } from "bun:test";
import {
    APP_SOUND,
    ClientCtx,
    ClientEvent,
    SoundCmd,
    playSound,
} from "../@/client";
import { AppClientFixture } from "../@/client/client-test-env";
import * as Sound from "./sound";

type Input =
	| {
			ctx?: ClientCtx;
			msg: Sound.Msg;
	  }
	| {
			ctx?: ClientCtx;
			msgCmd: SoundCmd;
	  }
	| {
			ctx?: ClientCtx;
			msgEvt: ClientEvent;
	  };

const Fixture = async () => {
	const f = await AppClientFixture();

	const init = Sound.init({
		ctx: f.ctx,
	}).model;

	const update = (init: Sound.Model, inputs: Input[]) => {
		let output: ReturnType<typeof Sound.update> = { model: init };
		for (const input of inputs) {
			output = Sound.update({
				ctx: input.ctx ?? f.ctx,
				model: output.model,
				...input,
			});
		}

		return output;
	};

	return {
		...f,
		init,
		update,
	};
};

describe(import.meta.file, () => {
	//

	test("make sound", async () => {
		const f = await Fixture();
		const after = f.update(f.init, [
			{
				msgCmd: playSound(APP_SOUND.tap),
			},
		]);
		expect(after.eff).toBeTruthy();
	});
});
