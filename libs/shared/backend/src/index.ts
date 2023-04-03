import { ClientId } from '@gamezilla/shared';

export * from './database-connection-mysql';
export * from './database-connection-postgres';
export * from './shared';

export type AppMsg = ['client-connected', { clientId: ClientId }];
