import { FlowVariant } from "../../../flow-variant";
import { FlowAlgoSolve } from "../../../flow/flow-algo";
import { MsgToWorker } from "./flow-algo-solve-async.types";

declare let self: Worker;

self.onmessage = (event: MessageEvent<unknown>) => {
	const parsed = MsgToWorker.parse(event.data);
	if (parsed.t === "err") {
		self.postMessage({
			t: "found-solution",
			model: null,
		});
		return;
	}
	switch (parsed.value.t) {
		case "find-solution": {
			const model = parsed.value.model;
			const distance = FlowVariant.distance(model);
			const solutions = FlowAlgoSolve.solve(model, { distance });
			for (const solution of solutions) {
				self.postMessage({
					t: "found-solution",
					model: solution,
				});
				return;
			}
			self.postMessage({
				t: "found-solution",
				model: null,
			});
			return;
		}
	}
};
