import { UserId } from '@gamezilla/shared/app';
import { FlowGridShorthand, FlowUI } from './flow';

//
//
// Model
//
//

export type FrontendModel = SharedModel;

export type BackendModel = SharedModel;

export type SharedModel = {
  playerId?: UserId;
  flowView: FlowUI.Model;
};

export const initShared: SharedModel = {
  flowView: FlowUI.init(FlowGridShorthand.samples['5x5']['2']),
};

//
//
// Msg
//
//

export type FrontendMsg = { t: 'flow-view'; c: FlowUI.Msg };

export type BackendMsg = ['none'];

export type ToBackend = ['none'];

export type ToFrontend = ['none'];
