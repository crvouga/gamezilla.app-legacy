import { describe, expect, it } from "bun:test";
import { Posix, RequestResponse, TimeSpan } from "gamezilla-app/@/core";
import { didSendToServer, didShowErrorSm } from "gamezilla-app/app/@/client";
import type { SpaceClientCtx } from "gamezilla-app/app/spaces/@/space";
import { SpaceClientFixture } from "gamezilla-app/app/spaces/@/testing/client";
import { FlowPack } from "..";
import { FlowPuzzle } from "../../flow-puzzle";
import { FlowPackGridClient } from "./flow-pack-grid.client";
import type {
	ModelClient,
	MsgClient,
	MsgToClient,
} from "./flow-pack-grid.types";

type Ctx = SpaceClientCtx & {
	pack: FlowPack | null;
};

type Input =
	| {
			ctx?: Ctx;
			msg: MsgClient;
	  }
	| {
			ctx?: Ctx;
			msgServer: MsgToClient;
	  };

const Fixture = async () => {
	const f = await SpaceClientFixture();
	const puzzle = await FlowPuzzle.random({
		createdBy: f.ctx.currentUserId,
	});
	const pack = await FlowPack.random({
		puzzleIds: [puzzle.id],
		createdBy: f.ctx.currentUserId,
	});

	const ctx = {
		...f.ctx,
		pack,
	};

	const updates = (initial: ModelClient, msgs: Input[]) => {
		const outputs: ReturnType<typeof FlowPackGridClient.update>[] = [
			{
				model: initial,
			},
		];

		let model = initial;

		for (const msg of msgs) {
			const outputNew = FlowPackGridClient.update({
				ctx,
				model,
				...msg,
			});
			model = outputNew.model;
			outputs.push(outputNew);
		}

		return outputs;
	};

	const update = (initial: ModelClient, msgs: Input[]) => {
		const outputs = updates(initial, msgs);
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		return outputs[outputs.length - 1]!;
	};

	const init = FlowPackGridClient.init({
		ctx,
	});

	return {
		...f,
		init,
		pack,
		puzzle,
		ctx,
		update,
	};
};

const msgServerListedByPuzzlesByIdOk = (puzzles: FlowPuzzle[]): Input => ({
	msgServer: {
		t: "listed-puzzles-by-id",
		listed: {
			t: "ok",
			value: {
				items: puzzles,
				limit: puzzles.length,
				offset: 0,
				total: puzzles.length,
			},
		},
	},
});

const isSubset = <T,>(subArray: T[], superArray: T[]): boolean => {
	return subArray.every((item) => superArray.includes(item));
};

const hasSameElements = <T,>(a: T[], b: T[]): boolean => {
	return isSubset(a, b) && isSubset(b, a);
};

describe(import.meta.file, () => {
	it("should send a request to list puzzles when grid is visible", async () => {
		const f = await Fixture();
		const output = f.update(f.init.model, [
			{
				msg: {
					t: "user-observed-grid",
				},
			},
		]);
		expect(
			didSendToServer(output, (msg) => msg.t === "list-puzzles-by-id"),
		).toBe(true);
	});

	it("should have missing puzzle ids in list request", async () => {
		const f = await Fixture();
		const output = f.update(f.init.model, [
			{
				msg: {
					t: "user-observed-grid",
				},
			},
		]);
		expect(
			didSendToServer(
				output,
				(msg) =>
					msg.t === "list-puzzles-by-id" &&
					hasSameElements(msg.puzzleIds, f.pack.puzzleIds),
			),
		).toBe(true);
	});

	it("should record puzzles listed by server", async () => {
		const f = await Fixture();
		const output = f.update(f.init.model, [
			msgServerListedByPuzzlesByIdOk([f.puzzle]),
		]);
		expect(output.model.puzzles[f.puzzle.id]).toEqual(f.puzzle);
	});

	it("should show an error when server sends an error while listing puzzles", async () => {
		const f = await Fixture();
		const error = "Something went wrong";
		const output = f.update(f.init.model, [
			{
				msgServer: {
					t: "listed-puzzles-by-id",
					listed: {
						t: "err",
						error,
					},
				},
			},
		]);

		expect(didShowErrorSm(output, error)).toBe(true);
	});

	it("should be in a loading state after requesting to list puzzles", async () => {
		const f = await Fixture();
		const output = f.update(f.init.model, [
			{
				msg: {
					t: "user-observed-grid",
				},
			},
		]);
		expect(RequestResponse.isRequesting(output.model.request)).toBe(true);
	});

	it("should in an ok state after server listed puzzles", async () => {
		const f = await Fixture();
		const output = f.update(f.init.model, [
			{
				msg: { t: "user-observed-grid" },
			},
			msgServerListedByPuzzlesByIdOk([f.puzzle]),
		]);
		expect(RequestResponse.isOk(output.model.request)).toBe(true);
	});

	it("should timeout request after too much time", async () => {
		const f = await Fixture();
		const output = f.update(f.init.model, [
			{
				msg: { t: "user-observed-grid" },
			},
			{
				ctx: {
					...f.ctx,
					now: Posix.future(f.ctx.now, TimeSpan.minutes(5)),
				},
				msg: { t: "elapsed" },
			},
		]);
		expect(RequestResponse.isTimedOut(output.model.request)).toBe(true);
	});
});
