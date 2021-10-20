<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/components/Button.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Link from "$lib/components/Link.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import PageHeaderTitle from "$lib/components/PageHeaderTitle.svelte";
  import { dataAccess } from "$lib/data-access";

  const handleUnauth = async () => {
    await dataAccess.auth.unauthenticate();
    goto("/");
  };
</script>

<PageHeader>
  <Link slot="prefix" to="/auth-user">
    <Icon iconName="chevron-left" />
  </Link>
  <PageHeaderTitle>Sign Out</PageHeaderTitle>
</PageHeader>

<div class="p-4">
  <Button slot="primary-button" on:click={handleUnauth} class="w-100">
    Sign Out
  </Button>
</div>
