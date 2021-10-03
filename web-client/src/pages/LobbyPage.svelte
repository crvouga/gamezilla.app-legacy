<script lang="ts">
	import { getContext, onMount } from "svelte";
	import { navigate } from "svelte-routing";
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
	import Typography from "../generic/Typography.svelte";
	import TicTacToe from "../tic-tac-toe/TicTacToe.svelte";
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

<style>
	input {
		width: 100%;
	}
</style>

<PageBar title="Lobby" />

<!-- <TicTacToe class="margin-bottom-1 max-width-small-breakpoint margin-auto" /> -->

<Container>
	<Button
		fullWidth
		text="Start Game"
		class="margin-bottom-1"
		onClick={async () => {}} />

	<Button
		fullWidth
		text="Leave Lobby"
		class="margin-bottom-1"
		onClick={async () => {
			await dataAccess.lobby.leave({
				userId: authUser.userId,
				lobbyId: lobbyId,
			});

			navigate('/');
		}} />

	<Button
		fullWidth
		text="Invite"
		class="margin-bottom-1"
		onClick={async () => {}} />

	<ol>
		{#each lobbyStates as lobbyState}
			{#each Object.values(lobbyState.users) as user}
				<li>
					<Avatar src={user.avatarUrl} alt={user.displayName} />
				</li>
			{/each}
		{/each}
	</ol>

	<input type="text" />
</Container>
