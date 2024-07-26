import {describe, expect, it} from 'bun:test';
import {Err, Ok, PhoneNumber, eq} from 'gamezilla-app/@/core';
import type {Route} from 'gamezilla-app/@/routing/generated/routes';
import {didPushRoute} from 'gamezilla-app/app/@/client';
import {FixtureAppClient} from 'gamezilla-app/app/@/client/client-test-env';
import type {AuthSMSTypes} from '.';
import {AuthSMSClient} from './auth-sms.client';

type Msg =
	| {
			msg: AuthSMSTypes.MsgClient;
	  }
	| {
			msgServer: AuthSMSTypes.MsgToClient;
	  };

const Fixture = async (input?: {currentRoute?: Route}) => {
	const f = await FixtureAppClient({
		currentRoute: input?.currentRoute ?? {
			n: 'auth-login',
			t: 'login-sms-request',
		},
	});

	const updates = (
		init: AuthSMSTypes.ModelClient,
		msgs: Msg[],
	) => {
		const updates: ReturnType<
			typeof AuthSMSClient.update
		>[] = [];
		let model = init;
		for (const msg of msgs) {
			const updated =
				AuthSMSClient.update(
					{
						ctx: f.ctx,
						model,
						...msg,
					},
				);
			model = updated.model;
			updates.push(updated);
		}
		return updates;
	};

	const update = (
		init: AuthSMSTypes.ModelClient,
		msgs: Msg[],
	) => {
		const updates_ = updates(init, msgs);
		return updates_[updates_.length - 1];
	};

	const init = AuthSMSClient.init({
		ctx: f.ctx,
		stored: null,
	}).model;

	const render = (model: AuthSMSTypes.ModelClient = init) => {
		const vDom = (
			<AuthSMSClient.View
				ctx={f.ctx}
				dispatch={() => {}}
				model={model}
			/>
		);
		const node = f.render(vDom);
		return node;
	};

	return {
		...f,
		init,
		update,
		render,
	};
};

describe(import.meta.file, () => {
	it('should navigate to verify code screen after code is sent', async () => {
		const f = await Fixture();

		const phoneNumber = PhoneNumber.random();

		const output = f.update(f.init, [
			{
				msgServer: {
					t: 'sent-code',
					phoneNumber,
					sent: Ok(
						null,
					),
				},
			},
		]);

		expect(
			didPushRoute(
				output,
				(msg) =>
					msg.n ===
						'auth-login' &&
					msg.t ===
						'login-sms-verify' &&
					eq(
						msg.phoneNumber,
						phoneNumber,
					),
			),
		).toBe(true);
	});

	it('should render error message when send code errors', async () => {
		const f = await Fixture();
		const output = f.update(f.init, [
			{
				msgServer: {
					t: 'sent-code',
					phoneNumber: PhoneNumber.random(),
					sent: Err(
						{
							t: 'hourly-limit-reached',
						},
					),
				},
			},
		]);
		const r = f.render(output?.model);
		const alertError = r.getByRole(
			'alert',
			f.ctx.t(
				'verify-sms-problem.send-code-hourly-limit-reached',
			),
		);
		expect(alertError).toBeTruthy();
	});

	it('should render error message when verify code errors', async () => {
		const phoneNumber = PhoneNumber.random();

		const f = await Fixture({
			currentRoute: {
				n: 'auth-login',
				t: 'login-sms-verify',
				phoneNumber,
			},
		});
		const output = f.update(f.init, [
			{
				msgServer: {
					t: 'verified-code',
					verified: Err(
						{
							t: 'verification-already-verified',
						},
					),
				},
			},
		]);
		const r = f.render(output?.model);
		const alertError = r.getByRole(
			'alert',
			f.ctx.t(
				'verify-sms-problem.verification-already-verified',
			),
		);
		expect(alertError).toBeTruthy();
	});

	it('should render code sent to phone number message', async () => {
		const phoneNumber = PhoneNumber.random();

		const f = await Fixture({
			currentRoute: {
				n: 'auth-login',
				t: 'login-sms-verify',
				phoneNumber,
			},
		});
		const r = f.render(f.init);
		const p = r.getByRole(
			'status',
			f.ctx.t(
				'auth-sms.enter-code-sent-to',
				PhoneNumber.format(
					phoneNumber,
				),
			),
		);
		expect(p).toBeTruthy();
	});
});
