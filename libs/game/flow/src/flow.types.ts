import { p } from '@gamezilla/core';
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

const puzzle = p(
  Flow.initGrid({ bounds: Flow.bounds8x8 }),
  (_) => Flow.setNode(_, { x: 0, y: 0, color: 'red' }),
  (_) => Flow.setNode(_, { x: 6, y: 6, color: 'red' })
);

export const initShared: SharedModel = {
  flowView: Flow.initViewModel(puzzle),
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
