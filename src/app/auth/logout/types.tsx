export type ModelClient = {}

export type MsgClient =
  | { t: 'logout-drawer-closed' }
  | { t: 'logout-drawer-clicked-cancel' }
  | { t: 'logout-drawer-clicked-confirm' }

export type MsgServer = { t: 'noop' }

export type MsgToServer = { t: 'user-clicked-confirm-logout-button' }

export type MsgToClient = { t: 'noop' }
