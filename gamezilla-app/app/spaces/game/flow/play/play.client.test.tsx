import {describe, it, test} from 'bun:test';
import {FixtureFlowPlayClient} from './@/fixture';

const Fixture = async () => {
	const f = await FixtureFlowPlayClient();
	return {
		...f,
	};
};

describe(import.meta.file, () => {
	it('should fetch puzzles in pack when on puzzle screen', async () => {
		const f = await Fixture();
		f;
		//
	});

	test('sound exit play mode ', async () => {
		const f = await Fixture();

		f;
	});
});
