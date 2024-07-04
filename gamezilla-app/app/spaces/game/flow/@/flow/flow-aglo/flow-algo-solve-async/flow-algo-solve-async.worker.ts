import { FlowAlgoSolve } from "../flow-algo-solve";
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
			const solution = FlowAlgoSolve.solve(model);
			self.postMessage({
				t: "found-solution",
				model: solution,
			});
		}
	}
};
