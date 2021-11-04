<script lang="ts">
  import { page } from "$app/stores";
  import Avatar from "$lib/components/Avatar.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Item from "$lib/components/Item.svelte";
  import Link from "$lib/components/Link.svelte";
  import type { IGameSession } from "$lib/features";
  import { onGameSession } from "$lib/features";
  import PageHeader from "$lib/shared/PageHeader.svelte";
  import { derived } from "svelte/store";

  const gameSessionStore = derived<[typeof page], IGameSession>(
    [page],
    ([page], set) => onGameSession({ gameSessionId: page.params.id }, set)
  );

  $: gameSession = $gameSessionStore;

  $: users = Object.values(gameSession?.users ?? {});
</script>

<PageHeader title="Lobby">
  <Link slot="prefix" to="/">
    <Icon iconName="chevron-left" />
  </Link>
</PageHeader>

<div class="p-4 pb-0 font-bold text-lg">Players</div>

{#each users as user}
  <Item>
    <Avatar slot="start" src={user.avatarUrl} />
    {user.name}
  </Item>
{/each}
