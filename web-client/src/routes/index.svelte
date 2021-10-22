<script lang="ts">
  import Avatar from "$lib/components/Avatar.svelte";
  import Button from "$lib/components/Button.svelte";
  import Link from "$lib/components/Link.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import PageHeaderTitle from "$lib/components/PageHeaderTitle.svelte";
  import { toAvatarSeed, toAvatarUrl } from "$lib/data-access/avatars";

  const handleCreateLobby = () => {};
</script>

<PageHeader>
  <PageHeaderTitle>Home</PageHeaderTitle>
  <Link slot="suffix" to="/auth-user">
    <Avatar
      src={toAvatarUrl({
        avatarSeed: toAvatarSeed('gello'),
        avatarStyle: 'adventurer-neutral',
      })} />
  </Link>
</PageHeader>

<div class="p-4">
  <Button on:click={handleCreateLobby}>Create Lobby</Button>
</div>
