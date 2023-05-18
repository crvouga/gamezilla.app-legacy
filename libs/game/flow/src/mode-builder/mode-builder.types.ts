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

export type BackendModel = SharedModel;

//
//
// Msg
//
//

export type FrontendMsg = { t: 'flow-grid-ui'; c: FlowGridUI.Msg };

export type BackendMsg = { t: 'none' };

export type ToBackend = { t: 'none' };

export type ToFrontend = { t: 'none' };
