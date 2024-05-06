import { describe, expect, it } from "bun:test";
import { didPlaySound } from "gamezilla-app/app/@/client";
import { andThen } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import { EventId } from "gamezilla-app/app/spaces/@/event";
import type { FlowClientCtx } from "../../@/flow-ctx";
import { initial, testFlowClientCtx } from "../@/testing/client";
import { CreateClient } from "../create.client";
import type { ModelClient } from "../create.types";

import { CreateCore } from "../create.core";
import type { ListTab } from "./list-tabs.types";
import { LamportTimestamp } from "gamezilla-app/@/lamport-clock";

const userChangedListTab =
	(ctx: FlowClientCtx, listTab: ListTab) => (model: ModelClient) => {
		return CreateClient.update({
			ctx,
			model,
			modelCore: CreateCore.initCore({ ctx }),
			msgCore: {
				t: "user-changed-list-tab",
				eventId: EventId.generate(),
				listTab,
				happenedAt: LamportTimestamp.fromNumber(0),
			},
		});
	};

describe(import.meta.file, () => {
	it("play a sound when changing list tabs", async () => {
		const ctx = await testFlowClientCtx();
		const output = andThen(initial, userChangedListTab(ctx, "packs"));
		expect(didPlaySound(output)).toBe(true);
	});
});
