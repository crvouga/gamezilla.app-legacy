import { UserId } from '@gamezilla/shared';

export * from './database-connection';

export type AppMsg = ['user-connected', { userId: UserId }];
