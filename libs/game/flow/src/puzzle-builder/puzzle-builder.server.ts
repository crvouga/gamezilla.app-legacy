import { FlowGrid } from '../flow-grid';
import { bounds8x8 } from '../flow-grid/flow-grid-position';
import { groupIdOrder } from '../flow/flow';
import { ServerModel } from './puzzle-builder.shared';

type Model = ServerModel;

export const init: Model = {
  mode: 'edit-groups',
  focusedGroupId: groupIdOrder[0],
  grid: FlowGrid.initEmpty({ bounds: bounds8x8 }),
};
