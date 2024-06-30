import type { FlowVariant } from "../../../flow-variant";
import { MsgToMaster, type MsgToWorker } from "./flow-algo-solve-async.types";

export const solve = async (
	model: FlowVariant.Model,
): Promise<FlowVariant.Model | null> => {
	const url = new URL("flow-algo-solve-async.worker.ts", import.meta.url).href;

	const worker = new Worker(url);

	const solutionPromise = new Promise<FlowVariant.Model | null>((resolve) => {
		worker.onmessage = (event: MessageEvent<unknown>) => {
			const parsed = MsgToMaster.parse(event.data);
			if (parsed.t === "err") {
				return;
			}
			switch (parsed.value.t) {
				case "found-solution": {
					resolve(parsed.value.model ?? null);
					return;
				}
			}
		};
	});

	const toWorker: MsgToWorker = {
		t: "find-solution",
		model,
	};

	worker.postMessage(toWorker);

	const solution = await Promise.race([
		solutionPromise,
		new Promise<FlowVariant.Model | null>((resolve) => {
			setTimeout(
				() => {
					resolve(null);
				},
				1000 * 60 * 10,
			);
		}),
	]);

	worker.terminate();

	return solution;
};
