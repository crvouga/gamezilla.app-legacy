import { describe, expect, it } from "bun:test";
import { SpaceGameFixtureClient } from "gamezilla-app/app/spaces/game/@/testing/client";
import { randomFlowPack } from "../../../../@/testing";
import { EditPackNameClient } from "./edit-pack-name.client";
import { EditPackNameCore } from "./edit-pack-name.core";
import { MsgCore } from "./edit-pack-name.types";
import { Err } from "gamezilla-app/@/core";
import { didShowErrorSm } from "gamezilla-app/app/@/client";
import { withId } from "gamezilla-app/app/spaces/@/event";
import { LamportTimestamp } from "gamezilla-app/@/lamport-clock";

const Fixture = async () => {
	const f = await SpaceGameFixtureClient();

	const pack = await randomFlowPack();

	const modelCore = EditPackNameCore.init({ pack });
	const model = null;
	return {
		...f,
		ctx: {
			...f.ctx,
			open: false,
		},
		model,
		modelCore,
		pack,
	};
};

describe(import.meta.file, () => {
	it("should propogate space event", async () => {
		const f = await Fixture();
		const msgCores: MsgCore[] = [
			{
				t: "edit-pack-name.user-inputted-draft-name",
				userId: f.ctx.space.hostId,
				packNameDraft: "pack-name",
			},
			{
				t: "edit-pack-name.user-clicked-save-button",
				userId: f.ctx.space.hostId,
			},
		];
		for (const msgCore of msgCores) {
			const output = EditPackNameClient.update({ ...f, msg: msgCore });
			expect(output.msgCore?.some((msg) => msg.t === msgCore.t)).toBe(true);
		}
	});

	it("should show error if persiting pack fails", async () => {
		const f = await Fixture();
		const output = EditPackNameClient.update({
			...f,
			msgCore: withId({
				t: "edit-pack-name.server-persisted-pack",
				result: Err("something errored"),
				userId: f.ctx.space.hostId,
				happenedAt: LamportTimestamp.fromNumber(0),
			}),
		});
		expect(didShowErrorSm(output)).toBe(true);
	});
});
