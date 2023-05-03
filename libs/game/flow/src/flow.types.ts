import { UserId } from '@gamezilla/shared';
import { Flow } from './flow';

//
//
// Model
//
//

export type FrontendModel = SharedModel;

export type BackendModel = SharedModel;

export type SharedModel = {
  playerId?: UserId;
  flowView: Flow.ViewModel;
};

export const initShared: SharedModel = {
  flowView: Flow.initViewModel(Flow.puzzles['5x5']),
};

//
//
// Msg
//
//

export type FrontendMsg = { t: 'flow-view'; c: Flow.ViewMsg };

export type BackendMsg = ['none'];

export type ToBackend = ['none'];

export type ToFrontend = ['none'];
