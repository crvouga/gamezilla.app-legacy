import { describe, expect, it } from "bun:test";
import { AppServerModule } from "gamezilla-app/app/@shared/architecture/app-server";
import { SpaceId } from "gamezilla-app/app/@shared/data";
import { didSendMsgToClient } from "gamezilla-app/app/@shared/server";
import { Fixture, init, userStartedSpace } from "../@shared/testing/server";
import type { ModelServer } from "../spaces.core";
import * as SpacesServer from "../spaces.server";

const clientAListSpaces =
	(f: ReturnType<typeof Fixture>) => (model: ModelServer) => {
		return SpacesServer.update({
			ctx: f.ctx,
			deps: f.deps,
			model,
			msgClient: {
				t: "list-spaces",
				clientId: f.clientA.clientId,
				sessionId: f.clientA.sessionId,
				limit: 10,
				offset: 0,
			},
		});
	};

describe(import.meta.file, () => {
	it("should list spaces when requested", async () => {
		const f = Fixture();
		const spaceId = SpaceId.generate();
		const output = await AppServerModule.andThen(
			init(),
			userStartedSpace(f.deps, f.clientA, spaceId),
			clientAListSpaces(f),
		);
		expect(didSendMsgToClient(output, (msg) => msg.t === "listed-spaces")).toBe(
			true,
		);
	});

	it("should include the started space in the response", async () => {
		const f = Fixture();
		const spaceId = SpaceId.generate();
		const output = await AppServerModule.andThen(
			init(),
			userStartedSpace(f.deps, f.clientA, spaceId),
			clientAListSpaces(f),
		);
		expect(
			didSendMsgToClient(
				output,
				(msg) =>
					msg.t === "listed-spaces" &&
					msg.spaces.some((space) =>
						space.events.some((event) => event.spaceId === spaceId),
					),
			),
		).toBe(true);
	});
});
