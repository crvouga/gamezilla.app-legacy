<script>
  import Icon from "$lib/components/Icon.svelte";
  import Link from "$lib/components/Link.svelte";
  import PageHeader from "$lib/shared/PageHeader.svelte";
  import { page } from "$app/stores";
  import { onGameSession } from "$lib/features";

  $: gameSessionId = $page.params.id;

  page.subscribe((page) => {
    const gameSessionId = page.params.id;

    onGameSession({ gameSessionId }, (gameSession) => {
      console.log(gameSession);
    });
  });
</script>

<PageHeader title="Lobby">
  <Link slot="prefix" to="/">
    <Icon iconName="chevron-left" />
  </Link>
</PageHeader>

{gameSessionId}
