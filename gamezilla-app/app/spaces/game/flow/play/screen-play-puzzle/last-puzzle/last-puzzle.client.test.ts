import {describe, expect, it} from 'bun:test';
import {FixtureScreenPlayPuzzleClient} from '../@/fixture.client';
import {didPlaySound} from 'gamezilla-app/app/@/client';
import {withEventMeta} from 'gamezilla-app/app/spaces/@/event';

const Fixture = async () => {
	const f = await FixtureScreenPlayPuzzleClient();
	return {
		...f,
	};
};

describe(import.meta.file, () => {
	it('should render select next pack button in completion dialog after completing last puzzle', async () => {
		const f = await Fixture();
		const before = f.render(f.initial);
		const output = f.update(
			f.initial,
			f.completeLastPuzzleMsgs,
		);
		const after = f.render(output);
		expect(
			before
				.getByRole(
					'dialog',
				)
				?.getByRole(
					'button',
					f.ctx.t(
						'flow.select-next-pack',
					),
				),
		).toBeFalsy();
		expect(
			after
				.getByRole(
					'dialog',
				)
				?.getByRole(
					'button',
					f.ctx.t(
						'flow.select-next-pack',
					),
				),
		).toBeTruthy();
	});

	it('should dispatch a msg after clicking select next pack button', async () => {
		const f = await Fixture();
		const output = f.update(
			f.initial,
			f.completeLastPuzzleMsgs,
		);
		const rendered = f.render(output);
		const button = rendered
			.getByRole('dialog')
			?.getByRole(
				'button',
				f.ctx.t(
					'flow.select-next-pack',
				),
			);
		button?.click();
		const msg = await rendered.msgs.once();
		expect(msg.t).toBe(
			'user-clicked-select-next-pack',
		);
	});

	it('should output select next pack event', async () => {
		const f = await Fixture();
		const initial = f.update(
			f.initial,
			f.completeLastPuzzleMsgs,
		);
		const output = f.update(initial, [
			{
				msg: {
					t: 'user-clicked-select-next-pack',
				},
			},
		]);
		expect(
			output.msgCore?.some(
				(m) =>
					m.t ===
					'user-clicked-select-next-pack',
			),
		).toBe(true);
	});

	it('should render congrats message after completing last puzzle', async () => {
		const f = await Fixture();
		const output = f.update(
			f.initial,
			f.completeLastPuzzleMsgs,
		);

		expect(
			f
				.render(output)
				.getByRole(
					'dialog',
				)
				?.getByRole(
					'heading',
					f.ctx.t(
						'app.congratulations',
					),
				),
		).toBeTruthy();
	});

	it('should dispatch correct msg after clicking select next pack button', async () => {
		const f = await Fixture();
		const output = f.update(
			f.initial,
			f.completeLastPuzzleMsgs,
		);
		const r = f.render(output);
		const button = r
			.getByRole('dialog')
			?.getByRole(
				'button',
				f.ctx.t(
					'flow.select-next-pack',
				),
			);
		button?.click();
		expect(button).toBeTruthy();
		const msg = await r.msgs.once();
		expect(msg.t).toBe(
			'user-clicked-select-next-pack',
		);
	});

	it('should play sound after clicking select next pack button', async () => {
		const f = await Fixture();
		const initial = f.update(
			f.initial,
			f.completeLastPuzzleMsgs,
		);
		const output = f.update(initial, [
			{
				msgCore: withEventMeta(
					{
						t: 'user-clicked-select-next-pack',
					},
				),
			},
		]);
		expect(didPlaySound(output)).toBe(true);
	});
});
