import { describe, expect, it } from "bun:test";
import { LamportTimestamp } from "gamezilla-app/@/lamport-clock";
import { didPlaySound } from "gamezilla-app/app/@/client";
import { EventId } from "gamezilla-app/app/spaces/@/event";
import { FlowPack } from "../../@/flow-pack";
import { FlowPlayClientFixture } from "../@/testing";

const Fixture = async () => {
	const f = await FlowPlayClientFixture();
	return {
		...f,
	};
};

describe(import.meta.file, () => {
	it("should render exit button", async () => {
		const f = await Fixture();
		const rendered = f.render(f.initial);
		expect(rendered.getByRole("button", f.ctx.t("app.exit"))).toBeTruthy();
	});
	it("should render select pack screen", async () => {
		const f = await Fixture();
		const r = f.render(f.initial);
		expect(r.getByRole("heading", f.ctx.t("flow.play"))).toBeTruthy();
	});
	it("should show pack screen after opening pack", async () => {
		const f = await Fixture();
		const pack = await FlowPack.random();
		const updated = f.update(f.initial, [
			{
				msg: {
					t: "user-clicked-open-pack-list-item",
					pack,
				},
			},
		]);
		const r = f.render(updated);
		expect(r.getByRole("heading", pack.name)).toBeTruthy();
	});
	it("should make a sound when opening a pack", async () => {
		const f = await Fixture();
		const pack = await FlowPack.random();
		const updated = f.update(f.initial, [
			{
				msgCore: {
					t: "user-clicked-open-pack-list-item",
					pack,
					eventId: EventId.generate(),
					happenedAt: LamportTimestamp.fromNumber(0),
				},
			},
		]);
		expect(didPlaySound(updated)).toBe(true);
	});
});
