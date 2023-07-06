import { FlowGrid } from "../flow-grid";

//
//
//
//
//
//

export type SharedModel = {
  grid: FlowGrid.Model;
};

export type ClientModel = SharedModel;

export type ServerModel = SharedModel;

//
//
//
//
//
//

export type ClientMsg = { t: null };

export type ServerMsg = { t: null };

export type ToServer = { t: null };

export type ToClient = { t: null };

//
//
//
//
//
//
//
//
