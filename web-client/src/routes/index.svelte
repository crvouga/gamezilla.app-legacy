<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Item from "$lib/components/Item.svelte";
  import Link from "$lib/components/Link.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import PageHeaderTitle from "$lib/components/PageHeaderTitle.svelte";

  const handleCreateLobby = () => {};
</script>

<PageHeader>
  <PageHeaderTitle>Home</PageHeaderTitle>
</PageHeader>

<div class="p-4">
  <Button on:click={handleCreateLobby}>Create Lobby</Button>
</div>

<Link to="/unauth">
  <Item>
    <Icon slot="start" iconName="sign-out" />
    Sign Out
    <Icon slot="end" iconName="chevron-right" />
  </Item>
</Link>
