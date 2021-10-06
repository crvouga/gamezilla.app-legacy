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
	import PageContainer from "../generic/PageContainer.svelte";
	import PageBar from "../generic/PageBar.svelte";
	import TextInput from "../generic/TextInput.svelte";
	import Icon from "../generic/Icon.svelte";

	export let lobbyId: string;

	const authUser: IAuthUser = getContext(authUserKey);

	let lobbyStates: ILobbyState[] = [];

	onMount(() => {
		dataAccess.lobby.onLobbyStatesChanged({ lobbyId }, (newlobbyStates) => {
			lobbyStates = newlobbyStates;
		});
	});
</script>

<PageBar>
	<Icon name="email" />
	<h1 slot="title">Lobby</h1>
</PageBar>

<!-- <TicTacToe class="margin-bottom-1 max-width-small-breakpoint margin-auto" /> -->

<PageContainer>
	<Button class="w-full mb-1" onClick={async () => {}}>Start Game</Button>

	<Button
		class="w-full mb-1"
		onClick={async () => {
			await dataAccess.lobby.leave({
				userId: authUser.userId,
				lobbyId: lobbyId,
			});
			navigate('/');
		}}>
		Leave Lobby
	</Button>

	<Button class="w-full mb-1" onClick={async () => {}}>Invite</Button>

	<form
		on:submit|preventDefault={(event) => {
			console.log(event);
		}}>
		<TextInput placeholder="Chat Message" />
	</form>

	{#each lobbyStates as lobbyState}
		{#each Object.values(lobbyState.users) as user}
			<Avatar src={user.avatarUrl} alt={user.displayName} />
		{/each}
	{/each}
</PageContainer>
