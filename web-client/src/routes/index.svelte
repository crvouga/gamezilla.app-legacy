<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import Link from "$lib/components/Link.svelte";
  import AuthUserAvatar from "$lib/shared/AuthUserAvatar.svelte";
  import PageHeader from "$lib/shared/PageHeader.svelte";
  import PageHeaderTitle from "$lib/shared/PageHeaderTitle.svelte";
</script>

<PageHeader>
  <PageHeaderTitle>Home</PageHeaderTitle>

  <div slot="suffix" class="flex items-center">
    <Link to="/search" class="mr-4">
      <Icon iconName="search" />
    </Link>

    <Link to="/auth-user">
      <AuthUserAvatar />
    </Link>
  </div>
</PageHeader>
