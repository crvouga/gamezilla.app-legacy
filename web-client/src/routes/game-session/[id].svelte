<script lang="ts">
  import { page } from "$app/stores";
  import Icon from "$lib/components/Icon.svelte";
  import Link from "$lib/components/Link.svelte";
  import type { IGameSession } from "$lib/features";
  import { onGameSession } from "$lib/features";
  import PageHeader from "$lib/shared/PageHeader.svelte";
  import { onDestroy } from "svelte";
  import { derived } from "svelte/store";

  $: gameSessionId = $page.params.id;

  const gameSessionStore = derived<[typeof page], IGameSession>(
    [page],
    ([page], set) => onGameSession({ gameSessionId: page.params.id }, set)
  );

  const unsubscribe = gameSessionStore.subscribe((gameSession) => {
    console.log(gameSession);
  });

  onDestroy(unsubscribe);
</script>

<PageHeader title="Lobby">
  <Link slot="prefix" to="/">
    <Icon iconName="chevron-left" />
  </Link>
</PageHeader>

{gameSessionId}
