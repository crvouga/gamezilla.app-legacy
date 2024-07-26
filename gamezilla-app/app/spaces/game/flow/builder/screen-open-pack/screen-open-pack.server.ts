import {GameServerModule} from 'gamezilla-app/app/spaces/@/architecture/game-server-v2';
import type {ServerModule} from '../builder.types';
import {PackCreateNewServer} from './create-new-pack/create-new-pack.server';

const update: ServerModule['update'] = async (input) => {
	return GameServerModule.andThen({model: input.model}, (model) =>
		PackCreateNewServer.update({
			...input,
			model,
		}),
	);
};

export const ScreenOpenPackServer = {
	update,
};
