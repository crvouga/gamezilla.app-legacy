import { ClientId } from '@gamezilla/shared';

export * from './database-connection';

export type AppMsg = ['client-connected', { clientId: ClientId }];
