import { UserId } from '@gamezilla/temp-shared';

export * from './database-connection';

export type AppMsg = ['user-connected', { userId: UserId }];
