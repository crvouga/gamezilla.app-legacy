<script lang="ts">
	import { getContext, onMount } from "svelte";
	import { navigate } from "svelte-routing";
	import { readable } from "svelte/store";
	import { dataAccess } from "../data-access";
	import {
		authUserKey,
		IAuthUser,
	} from "../data-access/auth-data-access.interface";
	import type { ILobbyState } from "../data-access/lobby-data-access.interface";
	import Avatar from "../generic/Avatar.svelte";
	import Button from "../generic/Button.svelte";
	import Container from "../generic/Container.svelte";
	import PageBar from "../generic/PageBar.svelte";
	import NotFound from "./NotFound.svelte";

	export let lobbyId: string;

	const authUser: IAuthUser = getContext(authUserKey);

	let lobbyStates: ILobbyState[] = [];

	onMount(() => {
		dataAccess.lobby.onLobbyStatesChanged({ lobbyId }, (newlobbyStates) => {
			lobbyStates = newlobbyStates;
		});
	});
</script>

{#if lobbyStates.length === 0}
	<NotFound title="Couldn't find lobby" />
{:else}
	<PageBar title="Lobby" />

	<Container>
		<Button
			fullWidth
			text="Leave Lobby"
			onClick={async () => {
				await dataAccess.lobby.leave({
					userId: authUser.userId,
					lobbyId: lobbyId,
				});

				navigate('/');
			}} />

		{#each lobbyStates as lobbyState}
			{#each Object.values(lobbyState.users) as user}
				<li>
					<Avatar src={user.avatarUrl} alt={user.displayName} />
				</li>
			{/each}
		{/each}
	</Container>
{/if}
