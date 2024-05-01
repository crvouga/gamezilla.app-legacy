import { describe, expect, it } from "bun:test";
import { andThen } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import { didPlaySound } from "gamezilla-app/app/@/client";
import {
	clickedPackItem,
	createFlowPack,
	initial,
	testFlowClientCtx,
} from "../../@/testing/client";
import { deriveModelSync } from "../../@/testing/game";

describe(import.meta.file, () => {
	it("should open pack builder when clicked pack list item", async () => {
		const ctx = await testFlowClientCtx();
		const pack = await createFlowPack(ctx);
		const output = andThen(initial, clickedPackItem(ctx, pack));
		const modelSync = deriveModelSync(ctx)(output);
		expect(modelSync.packBuilder?.pack.id === pack.id).toBe(true);
	});

	it("should play sound when clicked pack list item", async () => {
		const ctx = await testFlowClientCtx();
		const pack = await createFlowPack(ctx);
		const output = andThen(initial, clickedPackItem(ctx, pack));
		expect(didPlaySound(output)).toBe(true);
	});
});
