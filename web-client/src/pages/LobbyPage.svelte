<script lang="ts">
	import { getContext } from "svelte";
	import { navigate } from "svelte-routing";

	import { dataAccess } from "../data-access";
	import { authUserKey } from "../data-access/auth-data-access.interface";

	import Button from "../generic/Button.svelte";
	import Container from "../generic/Container.svelte";
	import PageBar from "../generic/PageBar.svelte";

	export let lobbyId: string;

	const authUser = getContext(authUserKey);
</script>

<PageBar title="Lobby" />

<Container>
	{lobbyId}
	<Button
		fullWidth
		text="Leave Lobby"
		onClick={async () => {
			await dataAccess.lobby.leave({ //@ts-ignore
				userId: authUser.userId, lobbyId: lobbyId }); //@ts-ignore

			navigate('/');
		}} />
</Container>
