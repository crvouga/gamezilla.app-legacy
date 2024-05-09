import { describe, expect, it } from "bun:test";
import { AppServerModule } from "gamezilla-app/app/@/architecture/app-server";
import { SpaceId } from "gamezilla-app/app/@/data";
import { didSendMsgToClient } from "gamezilla-app/app/@/server";
import {
	SpaceServerFixture,
	userJoinedSpace,
	userStartedSpace,
} from "../@/testing/server";

describe(import.meta.file, () => {
	it("should send a sync message to client that joined a space", async () => {
		const f = SpaceServerFixture();

		const spaceId = SpaceId.generate();
		const updated = await AppServerModule.andThen(
			f.init,
			userStartedSpace(f.deps, f.clientA, spaceId),
		);
		const output = await AppServerModule.andThen(
			updated,
			userJoinedSpace(f.deps, f.clientB, spaceId),
		);
		expect(didSendMsgToClient(output, (msg) => msg.t === "synced")).toBe(true);
	});
});
