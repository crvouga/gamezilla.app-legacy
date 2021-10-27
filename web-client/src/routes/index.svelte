<script lang="ts">
  import Clickable from "$lib/components/Clickable.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Item from "$lib/components/Item.svelte";
  import Link from "$lib/components/Link.svelte";
  import { errorToToast } from "$lib/components/toaster";
  import { createLobby } from "$lib/features/lobby";
  import { authStateStore, enqueueToast } from "$lib/shared";
  import AuthUserAvatar from "$lib/shared/AuthUserAvatar.svelte";
  import PageHeader from "$lib/shared/PageHeader.svelte";

  $: authState = $authStateStore;

  const handleCreateLobby = async () => {
    if (authState.status !== "authenticated") {
      return;
    }

    const { errors } = await createLobby({
      userId: authState.authUser.userId,
    });

    if (errors.length > 0) {
      enqueueToast(errors.map(errorToToast));

      return;
    }

    enqueueToast([
      {
        message: "Created Lobby",
      },
    ]);
  };
</script>

<PageHeader title="Home">
  <div slot="suffix" class="flex items-center">
    <Link to="/search" class="mr-4">
      <Icon iconName="search" />
    </Link>

    <Link to="/auth-user">
      <AuthUserAvatar />
    </Link>
  </div>
</PageHeader>

<Clickable on:click={handleCreateLobby}>
  <Item class="text-blue-600">
    <Icon slot="start" iconName="gamepad" />
    Create Lobby
  </Item>
</Clickable>
