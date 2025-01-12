export type ModelFrontend = {}

export type MsgFrontend =
  | { t: 'logout-drawer-closed' }
  | { t: 'logout-drawer-clicked-cancel' }
  | { t: 'logout-drawer-clicked-confirm' }

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = { t: 'user-clicked-confirm-logout-button' }

export type MsgToFrontend = { t: 'noop' }
