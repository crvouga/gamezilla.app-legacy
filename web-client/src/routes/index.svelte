<script lang="ts">
  import { stores } from "$lib/data-access";
  import Avatar from "$lib/components/Avatar.svelte";
  import Link from "$lib/components/Link.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import PageHeaderTitle from "$lib/components/PageHeaderTitle.svelte";
  import { toAvatarUrl } from "$lib/data-access/profile.interface";

  const { auth } = stores;

  $: authState = $auth;
</script>

<PageHeader>
  <PageHeaderTitle>Home</PageHeaderTitle>
  <Link slot="suffix" to="/auth-user">
    <Avatar
      src={authState.status === 'authenticated' ? toAvatarUrl(authState.authUser) : undefined} />
  </Link>
</PageHeader>
