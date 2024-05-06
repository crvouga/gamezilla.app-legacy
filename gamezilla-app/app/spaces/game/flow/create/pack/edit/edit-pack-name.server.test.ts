// import { describe, it } from "bun:test";
// import { Result } from "gamezilla-app/@/core";
// import { randomFlowPack } from "../../../@/testing";
// import { FlowCreateFixtureServer } from "../../@/testing/server";
// import { EditPackNameCore } from "./edit-pack-name.core";
// import { EditPackNameServer } from "./edit-pack-name.server";
// import { ModelCore, MsgCore } from "./edit-pack-name.types";

// const Fixture = async () => {
// 	const f = await FlowCreateFixtureServer();
// 	const pack = await randomFlowPack();
// 	const modelCore = EditPackNameCore.init({ pack });

// 	const updateCore = (init: ModelCore, msgs: MsgCore[]) => {
// 		return msgs.reduce(
// 			(model, msg) => EditPackNameCore.update({ ctx: f.ctx, model, msg }),
// 			init,
// 		);
// 	};

// 	await f.deps.FlowPackDb.put(pack);

// 	return {
// 		...f,
// 		pack,
// 		updateCore,
// 		modelCore,
// 	};
// };

// describe(import.meta.file, () => {
// 	it("should persist pack name when it changes", async () => {
// 		const f = await Fixture();
// 		const newPackName = "new-pack-name";
// 		await EditPackNameServer.update({
// 			...f,
// 		});
// 		const after = Result.withDefault(
// 			await f.deps.FlowPackDb.get(f.pack.id),
// 			null,
// 		);
// 		// expect(after?.name).toEqual(newPackName);
// 	});
// });
