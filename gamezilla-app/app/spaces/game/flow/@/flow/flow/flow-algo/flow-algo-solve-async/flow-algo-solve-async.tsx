import { FlowVariant } from "../../../flow-variant";
import { MsgToMaster, MsgToWorker } from "./flow-algo-solve-async.types";

export const solve = async (
	model: FlowVariant.Model,
): Promise<FlowVariant.Model | null> => {
	const worker = new Worker("./flow-algo-solve-async.worker.ts");

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

	const solution = await solutionPromise;

	return solution;
};
