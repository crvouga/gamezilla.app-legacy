import {broadcast, sendToClient, sendToUser} from 'gamezilla-app/app/@/server';
import {Result, isErr} from 'gamezilla-app/@/core';
import {SpaceServerModule} from '../architecture/space-server';
import {SpaceCoreState} from '../spaces-core';
import * as Space from '../spaces-core/space-core';
import * as SpacesCoreServer from '../spaces-core/spaces-core.server';
import type {MsgToClient, ServerDeps} from '../spaces.types';

//
//
//
//
//
//
//

const updateProfileCache: SpaceServerModule['update'] = async (input) => {
	const added = await input.deps.profileCache.add(
		input.msgClient?.profiles ?? {},
	);
	if (isErr(added)) {
		input.ctx.logger.error(
			`Error adding to profile cache. ${added.error}`,
		);
		return {model: input.model};
	}

	return {model: input.model};
};

const updateCore: SpaceServerModule['update'] = async (input) => {
	const {msgClient, model, deps} = input;

	switch (msgClient?.t) {
		case 'sync': {
			return SpaceServerModule.andThen(
				{
					model,
				},
				async (
					model,
				) => {
					await SpacesCoreServer.mergeOne(
						{
							spacesDb: deps.spaceCoreDb,
							space: msgClient.space,
						},
					);

					return {
						model,
					};
				},
				async (
					model,
				) => {
					const spaceId =
						Space.toSpaceId(
							msgClient.space,
						);

					if (
						!spaceId
					) {
						return {
							model,
						};
					}

					const spaceNew =
						await SpacesCoreServer.getSpaceById(
							deps.spaceCoreDb,
							spaceId,
						);

					if (
						!spaceNew
					) {
						return {
							model,
						};
					}

					const profiles =
						await spacesToProfiles(
							input.deps,
							[
								spaceNew,
							],
						);

					const starting =
						Space.startFromLatestSnapshot(
							spaceNew,
						);

					return {
						model,
						msgCmd: [
							sendToClient<MsgToClient>(
								[
									msgClient.clientId,
								],
								{
									t: 'synced',
									causedBy: msgClient.t,
									space: starting,
									profiles: profiles,
								},
							),
						],
					};
				},
			);
		}
		default: {
			return {
				model,
			};
		}
	}
};

const spacesToProfiles = async (deps: ServerDeps, spaces: Space.Model[]) => {
	const userIds = spaces.flatMap((space) => {
		const state = Space.deriveState(space);
		if (state.type === 'started') {
			return Object.values(
				state.users,
			);
		}
		return [];
	});

	const got = await deps.profileCache.get(userIds);

	const profiles = Result.withDefault(got, {});

	return profiles;
};

const updateCurrentUserSpace: SpaceServerModule['update'] = async (input) => {
	const {msgEvt, model, deps} = input;

	switch (msgEvt?.t) {
		case 'auth/client-authenticated': {
			const space =
				await SpacesCoreServer.getSpaceByUserId(
					deps.spaceCoreDb,
					msgEvt
						.account
						.userId,
				);

			if (!space) {
				return {
					model,
				};
			}

			const profiles =
				await spacesToProfiles(
					input.deps,
					[
						space,
					],
				);

			const started =
				Space.startFromLatestSnapshot(
					space,
				);

			return {
				model,
				msgCmd: [
					sendToClient<MsgToClient>(
						[
							msgEvt.clientId,
						],
						{
							t: 'current-user-space',
							space: started,
							profiles,
							causedBy: msgEvt.t,
						},
					),
				],
			};
		}

		default: {
			return {
				model,
			};
		}
	}
};

const sendSpaceEventToClient: SpaceServerModule['update'] = async ({
	model,
	msgSpaceEvent,
	deps,
}) => {
	if (!msgSpaceEvent) {
		return {model};
	}

	const msgEvtWithMeta = await SpacesCoreServer.getEventWithMeta(
		deps.spaceCoreDb,
		msgSpaceEvent.spaceId,
		msgSpaceEvent.eventId,
	);

	if (!msgEvtWithMeta) {
		return {model};
	}

	const spaceState = await SpacesCoreServer.getSpaceStarted(
		deps.spaceCoreDb,
		msgEvtWithMeta.spaceId,
	);

	const profiles = Result.withDefault(
		await deps.profileCache.get(
			'userId' in msgEvtWithMeta
				? [
						msgEvtWithMeta.userId,
				  ]
				: [],
		),
		{},
	);

	const toClient: MsgToClient = {
		t: 'event',
		c: msgEvtWithMeta,
		profiles,
	};

	if (spaceState && msgEvtWithMeta.t === 'game') {
		return {
			model,
			msgCmd: [
				sendToUser<MsgToClient>(
					SpaceCoreState.toUserIds(
						spaceState,
					),
					toClient,
				),
			],
		};
	}

	return {
		model,
		msgCmd: [broadcast<MsgToClient>(toClient)],
	};
};

const outputSpaceEventsFromServer: SpaceServerModule['update'] = (input) => {
	const {model, msgClient} = input;

	switch (msgClient?.t) {
		case 'event': {
			return {
				model,
				msgSpaceEvent: [
					msgClient.c,
				],
			};
		}
	}

	return {model};
};

const update: SpaceServerModule['update'] = async (input) => {
	return SpaceServerModule.andThen(
		{model: input.model},
		(model) =>
			updateCore({
				...input,
				model,
			}),
		(model) =>
			updateCurrentUserSpace({
				...input,
				model,
			}),
		(model) =>
			updateProfileCache({
				...input,
				model,
			}),
		(model) =>
			sendSpaceEventToClient({
				...input,
				model,
			}),
		(model) =>
			outputSpaceEventsFromServer({
				...input,
				model,
			}),
	);
};

export const SyncServer = {
	update,
};
