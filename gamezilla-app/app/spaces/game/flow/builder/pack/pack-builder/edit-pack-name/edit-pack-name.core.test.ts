import { describe, expect, it } from "bun:test";
import { Err, Ok } from "gamezilla-app/@/core";
import { SpaceCoreFixture } from "gamezilla-app/app/spaces/@/testing/core";
import { FlowPack } from "../../../../@/flow-pack";
import { EditPackNameCore } from "./edit-pack-name.core";
import type { ModelCore, MsgCore } from "./edit-pack-name.types";

const Fixture = async () => {
	const f = SpaceCoreFixture();

	const update = (init: ModelCore, msgs: MsgCore[]) => {
		return msgs.reduce(
			(model, msg) =>
				EditPackNameCore.update({ ctx: f.ctx, modelCore: model, msgCore: msg }),
			init,
		);
	};

	const pack = await FlowPack.random();

	return {
		...f,
		pack,
		init: EditPackNameCore.init({ pack }),
		update,
	};
};

describe(import.meta.file, () => {
	it("should let host input pack name", async () => {
		const f = await Fixture();
		const packNameDraft = "pack-name";
		const model = f.update(f.init, [
			{
				t: "edit-pack-name.user-inputted-draft-name",
				userId: f.hostId,
				packNameDraft,
			},
		]);
		expect(model.draft).toBe(packNameDraft);
	});

	it("should only allow host to input pack name", async () => {
		const f = await Fixture();
		const packNameDraft = "pack-name";
		const model = f.update(f.init, [
			{
				t: "edit-pack-name.user-inputted-draft-name",
				userId: f.guestId,
				packNameDraft,
			},
		]);
		expect(model.draft).toBe("");
	});

	it("should be loading after saving pack name", async () => {
		const f = await Fixture();
		const model = f.update(f.init, [
			{
				t: "edit-pack-name.user-clicked-save-button",
				userId: f.hostId,
			},
		]);
		expect(model.result.t).toBe("loading");
	});

	it("should be ok if persisting pack is ok", async () => {
		const f = await Fixture();
		const model = f.update(f.init, [
			{
				t: "edit-pack-name.server-persisted-pack",
				userId: f.hostId,
				result: Ok(null),
			},
		]);
		expect(model.result.t).toBe("ok");
	});

	it("should be error if persisting pack is error", async () => {
		const f = await Fixture();
		const model = f.update(f.init, [
			{
				t: "edit-pack-name.server-persisted-pack",
				userId: f.hostId,
				result: Err("some error"),
			},
		]);
		expect(model.result.t).toBe("err");
	});

	it("should error if name is empty", async () => {
		const f = await Fixture();
		const model = f.update(f.init, [
			{
				t: "edit-pack-name.user-inputted-draft-name",
				userId: f.hostId,
				packNameDraft: "",
			},
		]);
		expect(model.validationError?.t).toBe("name-cannot-be-empty");
	});

	it("should clear validation error after input of non empty name", async () => {
		const f = await Fixture();
		const model = f.update(f.init, [
			{
				t: "edit-pack-name.user-inputted-draft-name",
				userId: f.hostId,
				packNameDraft: "",
			},
			{
				t: "edit-pack-name.user-inputted-draft-name",
				userId: f.hostId,
				packNameDraft: "pack-name",
			},
		]);
		expect(model.validationError).toBe(null);
	});

	it("should optimisitcally update pack name", async () => {
		const f = await Fixture();
		const newPackName = "pack";
		const model = f.update(f.init, [
			{
				t: "edit-pack-name.user-inputted-draft-name",
				userId: f.hostId,
				packNameDraft: newPackName,
			},
			{
				t: "edit-pack-name.user-clicked-save-button",
				userId: f.hostId,
			},
		]);
		expect(String(model.pack.name)).toBe(newPackName);
	});

	it("should rollback pack name if persiting errors", async () => {
		const f = await Fixture();
		const model = f.update(f.init, [
			{
				t: "edit-pack-name.user-inputted-draft-name",
				userId: f.hostId,
				packNameDraft: `${f.pack.name} edits`,
			},
			{
				t: "edit-pack-name.user-clicked-save-button",
				userId: f.hostId,
			},
			{
				t: "edit-pack-name.server-persisted-pack",
				userId: f.hostId,
				result: Err("some error"),
			},
		]);

		expect(model.pack.name).toBe(f.pack.name);
	});
});
