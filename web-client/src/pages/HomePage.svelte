<script lang="ts">
	import { getContext } from "svelte";
	import { navigate } from "svelte-routing";
	import { dataAccess } from "../data-access";
	import {
		authUserKey,
		IAuthUser,
	} from "../data-access/auth-data-access.interface";
	import Button from "../generic/Button.svelte";
	import PageContainer from "../generic/PageContainer.svelte";
	import PageBar from "../generic/PageBar.svelte";
	import Icon from "../generic/Icon.svelte";

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
	<Icon name="chevron-left" />
	<h1 slot="title">Home</h1>
</PageBar>

<PageContainer>
	<Button on:click={handleCreateLobby} isLoading={state === 'creating-lobby'}>
		Create Lobby
	</Button>

	<Button href="/auth-user/lobby">Your Lobbies</Button>
	<Button href="/unauth">Sign Out</Button>
</PageContainer>
