import { describe, expect, it } from "bun:test";
import { expectByText, getByRole } from "gamezilla-app/@/vdom/vdom-testing";
import { didPlaySound } from "gamezilla-app/app/@/client";
import { FlowPack } from "../../@/flow-pack";
import { ClientFixture } from "../@/testing";
import { EventId } from "gamezilla-app/app/spaces/@/event";
import { LamportTimestamp } from "gamezilla-app/@/lamport-clock";

describe(import.meta.file, () => {
	it("should render exit button", async () => {
		const f = await ClientFixture();
		expectByText(f.render(f.initial), f.ctx.t("app.exit"));
	});
	it("should render select pack screen", async () => {
		const f = await ClientFixture();
		const rendered = f.render(f.initial);
		expect(getByRole(rendered, "heading")?.innerHTML).toBe(
			f.ctx.t("flow.play"),
		);
	});
	it("should show pack screen after selecting pack", async () => {
		const f = await ClientFixture();
		const pack = await FlowPack.random();
		const updated = f.update(f.initial, [
			{
				msg: {
					t: "user-clicked-pack-list-item",
					pack,
				},
			},
		]);
		const rendered = f.render(updated);
		expect(getByRole(rendered, "heading")?.innerHTML).toInclude(pack.name);
	});
	it("should make a sound when selecting a pack", async () => {
		const f = await ClientFixture();
		const pack = await FlowPack.random();
		const updated = f.update(f.initial, [
			{
				msgCore: {
					t: "user-clicked-pack-list-item",
					pack,
					eventId: EventId.generate(),
					happenedAt: LamportTimestamp.fromNumber(0),
				},
			},
		]);
		expect(didPlaySound(updated)).toBe(true);
	});
});
