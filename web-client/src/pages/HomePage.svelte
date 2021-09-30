<script lang="ts">
	import { getContext } from "svelte";
	import { navigate } from "svelte-routing";
	import { dataAccess } from "../data-access";
	import {
		authUserKey,
		IAuthUser,
	} from "../data-access/auth-data-access.interface";
	import Button from "../generic/Button.svelte";
	import Container from "../generic/Container.svelte";
	import PageBar from "../generic/PageBar.svelte";

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

<PageBar title="Home" />

<Container>
	<Button
		loading={state === 'creating-lobby'}
		fullWidth
		text="Create Lobby"
		class="margin-bottom-1"
		onClick={handleCreateLobby} />

	<Button
		fullWidth
		text="Your Lobbies"
		class="margin-bottom-1"
		onClick={() => {
			navigate('/auth-user/lobby');
		}} />

	<Button
		fullWidth
		text="Sign Out"
		class="margin-bottom-1"
		onClick={() => {
			navigate('/unauth');
		}} />
</Container>
