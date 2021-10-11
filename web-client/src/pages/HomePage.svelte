<script lang="ts">
	import { getContext } from "svelte";
	import { navigate } from "svelte-routing";
	import { dataAccess } from "../data-access";
	import {
		authUserKey,
		IAuthUser,
	} from "../data-access/auth-data-access.interface";
	import Badge from "../generic/Badge.svelte";
	import Button from "../generic/Button.svelte";
	import Icon from "../generic/Icon.svelte";
	import Item from "../generic/Item.svelte";
	import Link from "../generic/Link.svelte";
	import PageBar from "../generic/PageBar.svelte";
	import { lobbyStatesStore } from "../stores";

	const authUser: IAuthUser = getContext(authUserKey);

	let state: "idle" | "creating-lobby" = "idle";

	const handleCreateLobby = async () => {
		state = "creating-lobby";

		const { lobbyId, errors } = await dataAccess.lobby.create({
			user: authUser,
		});

		if (errors.length > 0) {
			alert(errors[0].message);
		}

		if (lobbyId) {
			navigate(`lobby/${lobbyId}`);
		}

		state = "idle";
	};
</script>

<PageBar>
	<h1 slot="title">Home</h1>
</PageBar>

<div class="p-2">
	<Button on:click={handleCreateLobby} isLoading={state === 'creating-lobby'}>
		<Icon slot="prefix" iconName="gamepad" />
		Create Lobby
	</Button>
</div>

<Link to="/auth-user/lobby">
	<Item>
		Your Lobbies
		<Badge slot="end">{$lobbyStatesStore.length}</Badge>
	</Item>
</Link>

<Link to="/unauth">
	<Item>
		Sign Out
		<Icon slot="end" iconName="sign-out" />
	</Item>
</Link>

<!-- <Button href="/auth-user/lobby">Your Lobbies</Button>
	<Button href="/unauth">Sign Out</Button> -->
