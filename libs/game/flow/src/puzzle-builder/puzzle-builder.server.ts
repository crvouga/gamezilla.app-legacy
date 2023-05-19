import { FlowGrid } from '../flow-grid';
import { bounds8x8 } from '../flow-grid/flow-grid-position';
import { ServerModel } from './puzzle-builder.shared';

type Model = ServerModel;

export const init: Model = {
  grid: FlowGrid.initEmpty({ bounds: bounds8x8 }),
};
