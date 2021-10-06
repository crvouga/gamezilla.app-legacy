<script lang="ts">
	import { getContext, onMount } from "svelte";
	import { Link, navigate } from "svelte-routing";
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
	import IconButton from "../generic/IconButton.svelte";

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

<PageBar>
	<Link slot="left" to="/">
		<IconButton name="chevron-left" />
	</Link>
	<h1 slot="title">Lobby</h1>
</PageBar>

<PageContainer>
	<Button>Start Game</Button>

	<Button on:click={handleLeaveLobby}>Leave Lobby</Button>

	<Button>Invite</Button>

	<TextInput placeholder="Chat Message" />
</PageContainer>
