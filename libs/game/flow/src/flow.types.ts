import { UserId } from '@gamezilla/shared/app';
import { FlowGridShorthand, FlowGridUI } from './flow-grid';

//
//
// Model
//
//

export type FrontendModel = SharedModel;

export type BackendModel = SharedModel;

export type SharedModel = {
  playerId?: UserId;
  gridUI: FlowGridUI.Model;
};

export const initShared: SharedModel = {
  gridUI: FlowGridUI.init(FlowGridShorthand.samples['6x6']['1']),
};

//
//
// Msg
//
//

export type FrontendMsg = { t: 'flow-grid-ui'; c: FlowGridUI.Msg };

export type BackendMsg = ['none'];

export type ToBackend = ['none'];

export type ToFrontend = ['none'];
