<script lang="ts">
	import { getContext, onMount } from "svelte";
	import { navigate } from "svelte-routing";
	import { dataAccess } from "../data-access";
	import {
		authUserKey,
		IAuthUser,
	} from "../data-access/auth-data-access.interface";
	import type { ILobbyState } from "../data-access/lobby-data-access.interface";
	import Button from "../generic/Button.svelte";
	import Icon from "../generic/Icon.svelte";

	export let lobbyId: string;

	const authUser: IAuthUser = getContext(authUserKey);

	let lobbyStates: ILobbyState[] = [];

	onMount(() => {
		dataAccess.lobby.onLobbyStatesChanged({ lobbyId }, (newlobbyStates) => {
			lobbyStates = newlobbyStates;
		});
	});

	const handleLeaveLobby = async () => {
		await dataAccess.lobby.leave({
			userId: authUser.userId,
			lobbyId: lobbyId,
		});
		navigate("/");
	};
</script>

<div class="p-2">
	<Button on:click={handleLeaveLobby}>
		<Icon slot="prefix" iconName="chevron-left" />
		Leave Lobby
	</Button>
</div>
