import { describe, it } from "bun:test";
import { PackBuilderSync } from "./pack-builder.sync";
import { SpaceGameSyncFixture } from "gamezilla-app/app/spaces/game/@/testing/sync";
import { randomFlowPack } from "../../../@/testing";



const Fixture = async () => {
	const f = SpaceGameSyncFixture()
	const pack = await randomFlowPack()
	const modelSync = PackBuilderSync.initSync({ pack })
	return {
		...f,
		modelSync
	}
}

describe(import.meta.file, () => {
	it('should remove puzzle from pack after clicking remove button', async () => {
		const f = await Fixture()


		PackBuilderSync.reducer({
			...f,
			msgSync: {
				t: 'pack-builder.user-clicked-pack-item',
				index: 0,
				puzzle: f.modelSync.packBuilder.pack.puzzles[0]
			},
		})
	})
})