import { FlowGrid, FlowGridUI } from '../flow-grid';
import { bounds8x8 } from '../flow-grid/flow-grid-position';

//
//
// Model
//
//

export type SharedModel = {
  grid: FlowGrid.Model;
};

export type ClientModel = SharedModel & FlowGridUI.Model;

export type ServerModel = SharedModel;

export const initShared: SharedModel = {
  grid: FlowGrid.initEmpty({ bounds: bounds8x8 }),
};

//
//
// Msg
//
//

export type ClientMsg = { t: 'flow-grid-ui'; c: FlowGridUI.Msg };

export type ServerMsg = { t: 'none' };

export type ToServer = { t: 'none' };

export type ToClient = { t: 'none' };
