import {UserId} from 'gamezilla-app/app/@/data';

export type FlowCoreEvent = {
	t: 'user-clicked-exit-mode-button';
	userId: UserId;
};
