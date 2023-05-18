import { FlowGrid, FlowGridUI } from '../flow-grid';

//
//
// Model
//
//

export type SharedModel = {
  grid: FlowGrid.Model;
};

export type FrontendModel = SharedModel & FlowGridUI.Model;

export type ServerModel = SharedModel;

//
//
// Msg
//
//

export type FrontendMsg = { t: 'flow-grid-ui'; c: FlowGridUI.Msg };

export type ServerMsg = { t: 'none' };

export type ToBackend = { t: 'none' };

export type ToFrontend = { t: 'none' };
