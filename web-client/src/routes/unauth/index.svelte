<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/components/Button.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Link from "$lib/components/Link.svelte";
  import { signOut } from "$lib/features";
  import PageHeader from "$lib/shared/PageHeader.svelte";
  import PageHeaderTitle from "$lib/shared/PageHeaderTitle.svelte";

  const handleUnauth = async () => {
    await signOut();

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
