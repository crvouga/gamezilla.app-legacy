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
		expect(
			rendered.getByText(f.ctx.t("app.exit")).hasText(f.ctx.t("app.exit")),
		).toBe(true);
	});
	it("should render select pack screen", async () => {
		const f = await Fixture();
		const rendered = f.render(f.initial);
		expect(rendered.getByRole("heading").hasText(f.ctx.t("flow.play"))).toBe(
			true,
		);
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
		const rendered = f.render(updated);
		expect(rendered.getByRole("heading").hasText(pack.name)).toBe(true);
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
