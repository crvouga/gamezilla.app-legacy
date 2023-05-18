import { FlowGrid, FlowGridUI } from '../flow-grid';

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

//
//
// Msg
//
//

export type ClientMsg = { t: 'flow-grid-ui'; c: FlowGridUI.Msg };

export type ServerMsg = { t: 'none' };

export type ToServer = { t: 'none' };

export type ToClient = { t: 'none' };
