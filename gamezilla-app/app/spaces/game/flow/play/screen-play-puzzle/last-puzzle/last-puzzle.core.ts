import type {CoreModule} from '../../play.types';

const updateCore: CoreModule['updateCore'] = ({modelCore, msgCore}) => {
	switch (msgCore.t) {
		case 'user-clicked-select-next-pack': {
			return {
				...modelCore,
				screen: {
					t: 'screen-select-pack',
				},
			};
		}
		default: {
			return modelCore;
		}
	}
};

export const LastPuzzleCore = {
	updateCore,
};
