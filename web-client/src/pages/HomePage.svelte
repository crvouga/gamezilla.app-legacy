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

	const handleCreateLobby = async () => {
		dataAccess.lobby.create({
			userId: authUser.userId,
		});
	};
</script>

<PageBar title="Home" />

<Container>
	<Button
		fullWidth
		text="Create Lobby"
		class="margin-bottom-1"
		onClick={handleCreateLobby} />

	<Button
		fullWidth
		text="Sign Out"
		onClick={() => {
			navigate('/unauth');
		}} />
</Container>
