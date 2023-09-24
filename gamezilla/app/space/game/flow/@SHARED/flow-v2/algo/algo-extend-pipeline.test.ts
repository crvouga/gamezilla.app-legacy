import { test } from "vitest";
import { FlowGridShorthand } from "../grid";
import { extendPipeline } from "./algo-extend-pipeline";
import { positionToNodeId } from "../grid/grid";

const sample: FlowGridShorthand.Model = [
  ["A", null, "A"],
  [null, null, null],
  [null, null, null],
];

test("algo-extend-pipeline", async () => {
  const grid = FlowGridShorthand.fromShorthand(sample);

  const extended = extendPipeline({
    model: grid.flow,
    groupId: "A",
    newId: positionToNodeId({
      x: 1,
      y: 0,
    }),
  });

  const result = grid;
});
