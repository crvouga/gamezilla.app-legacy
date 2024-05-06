import { describe, expect, it } from "bun:test";
import { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import { didPlaySound, didShowToast } from "gamezilla-app/app/@/client";
import {
	clickedPackCreateNewButton,
	createFlowPack,
	initial,
	testFlowClientCtx,
	userCreatedPack,
} from "../../@/testing/client";

describe(import.meta.file, () => {
	it("should make a sound when the user clicks the create button", async () => {
		const ctx = await testFlowClientCtx();

		const output = GameClientModule.andThen(
			initial,
			clickedPackCreateNewButton(ctx),
		);

		expect(didPlaySound(output)).toBe(true);
	});

	it("should play a sound after user created a pack", async () => {
		const ctx = await testFlowClientCtx();
		const pack = await createFlowPack(ctx);
		const output = GameClientModule.andThen(
			initial,
			userCreatedPack(ctx, pack),
		);

		expect(didPlaySound(output)).toBe(true);
	});

	it("should show toast after server created current users pack", async () => {
		const ctx = await testFlowClientCtx();
		const pack = await createFlowPack(ctx);
		const output = GameClientModule.andThen(
			initial,
			userCreatedPack(ctx, pack),
		);
		expect(didShowToast(output)).toBe(true);
	});
});
