import { describe, expect, it } from "bun:test";
import { andThen } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import { defaultModelSync, initial, testFlowClientCtx, createFlowPuzzle, } from "../../@TEST/client";
import { FlowPuzzle } from "../../../../@SHARED/flow-puzzle/flow-puzzle";
import { CreateClient } from "../../create.client";
import { ModelClient } from "../../create.core";
import { deriveModelSync } from "../../@TEST/game";
import { didPlaySound } from "gamezilla-app/@CHILD/app/@SHARED/client";
import { EventId } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { LamportTimestamp } from "gamezilla-app/@SHARED/lamport-clock";
const ctx = testFlowClientCtx();
const clickedPuzzleListItem = (puzzle: FlowPuzzle) => (model: ModelClient) => {
    return CreateClient.update({
        ctx: ctx,
        model,
        modelSync: defaultModelSync,
        msg: {
            t: "puzzle-list.clicked-puzzle-list-item",
            puzzle,
        },
    });
};
const userClickedPuzzleListItem = (puzzle: FlowPuzzle) => (model: ModelClient) => {
    return CreateClient.update({
        ctx: ctx,
        model,
        modelSync: defaultModelSync,
        msgSync: {
            t: "puzzle-list.clicked-puzzle-list-item",
            puzzle,
            eventId: EventId.generate(),
            happenedAt: LamportTimestamp.fromNumber(0),
        },
    });
};
describe(import.meta.file, () => {
    it("should open puzzle builder after clicking a puzzle in the list", async () => {
        const puzzle = createFlowPuzzle(ctx);
        const output = await andThen(initial, clickedPuzzleListItem(puzzle));
        const modelSync = deriveModelSync(output);
        expect(modelSync.opened.t === "puzzle-builder" &&
            modelSync.puzzleBuilder?.puzzle.id === puzzle.id).toBeTrue();
    });
    it("should play a sound when clicking a puzzle in the list", async () => {
        const puzzle = createFlowPuzzle(ctx);
        const output = await andThen(initial, userClickedPuzzleListItem(puzzle));
        expect(didPlaySound(output)).toBeTrue();
    });
});
